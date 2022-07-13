import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import sdk from "./initSdk";
import { EditionDrop, Token, Vote } from "@thirdweb-dev/sdk";

export default class DeployScripts {
  private nftContract: EditionDrop;
  private tokenContract: Token;
  private voteContract: Vote;

  private deployMembershipContract = async () => {
    const contractAddress = await sdk.deployer.deployEditionDrop({
      name: "DegenDAO Membership NFT",
      description: "Collection of ERC1155 nfts for DegenDAO members",
      primary_sale_recipient: ethers.constants.AddressZero,
      image: fs.readFileSync(path.resolve("./public/nft-image.jpg")),
    });
    this.nftContract = sdk.getEditionDrop(contractAddress);
    console.log("Nft contract deployed");
  };

  private initNFTMetadata = async () => {
    await this.nftContract.createBatch([
      {
        name: "DegenDAO Access",
        description: "Hold this nft to be a member of DegenDAO!",
        image: fs.readFileSync(path.resolve("./public/nft-image.jpg")),
      },
    ]);
    console.log("Nft metadata initialized");
  };

  private setConditions = async () => {
    await this.nftContract.claimConditions.set(0, [
      {
        quantityLimitPerTransaction: 1,
        price: 0,
        maxQuantity: 5000,
        startTime: new Date(),
        waitInSeconds: ethers.constants.MaxUint256,
      },
    ]);
    console.log("Conditions set");
  };

  private deployGovToken = async () => {
    const address = await sdk.deployer.deployToken({
      name: "DegenDAO Governance Token",
      symbol: "DEGEN",
      primary_sale_recipient: ethers.constants.AddressZero,
    });
    this.tokenContract = sdk.getToken(address);
    this.tokenContract.delegateTo(await sdk.wallet.getAddress());
    console.log("Token contract deployed");
  };

  mintGovTokens = async (amount: number) => {
    const tokenContractAddress = process.env.REACT_APP_TOKEN_CONTRACT;
    const tokenContract =
      this.tokenContract ?? sdk.getToken(tokenContractAddress);
    await tokenContract.mintToSelf(amount);
    const totalSupply = await tokenContract.totalSupply();
    console.log(
      "Minted " +
        amount +
        " tokens! " +
        `Now there is total supply of ${totalSupply.displayValue} tokens`
    );
  };

  airdropTokens = async (amountToEachWallet: number) => {
    const nftContract = sdk.getEditionDrop(process.env.REACT_APP_DROP_CONTRACT);
    const tokenContract = sdk.getToken(process.env.REACT_APP_TOKEN_CONTRACT);
    const minters = await nftContract.history.getAllClaimerAddresses(0);
    const totalAmountToTransfer = ethers.BigNumber.from(
      minters.length.toString()
    )
      .mul(ethers.BigNumber.from(amountToEachWallet.toString()))
      .mul(
        ethers.BigNumber.from(
          (10 ** (await tokenContract.get()).decimals).toString()
        )
      );
    const airdropWalletBalance = (
      await tokenContract.balanceOf(await sdk.wallet.getAddress())
    ).value;
    if (minters) {
      if (totalAmountToTransfer.lte(airdropWalletBalance)) {
        const transferArgs = minters.map((address) => {
          return { amount: amountToEachWallet, toAddress: address };
        });
        await tokenContract.transferBatch(transferArgs);
        console.log(
          `Success! ${amountToEachWallet} tokens have been transfered to each of ${minters.length} addresses`
        );
      } else
        throw new Error(
          `Not enough tokens on airdrop wallet to transfer to all addresses. Need ${totalAmountToTransfer
            .sub(airdropWalletBalance)
            .div(String(10 ** 18))
            .toString()} more tokens`
        );
    } else console.log("No addresses to transfer");
  };

  async revokeAdminRoles() {
    const token =
      this.tokenContract ?? sdk.getToken(process.env.REACT_APP_TOKEN_CONTRACT);
    await token.roles.revoke("admin", await sdk.wallet.getAddress());
    await token.roles.revoke("minter", await sdk.wallet.getAddress());
    console.log("Admin roles revoked");
  }

  private async deployVoteContract() {
    const voteContractAddress = await sdk.deployer.deployVote({
      name: "DegenDAO",
      voting_token_address: this.tokenContract?.getAddress(),
      voting_period_in_blocks: 6570,
      proposal_token_threshold: 500,
      voting_delay_in_blocks: 0,
      voting_quorum_fraction: 10,
    });
    console.log("Vote contract deployed: " + voteContractAddress);
    this.voteContract = sdk.getVote(voteContractAddress);
  }

  private async setupVoteTreasury(communityTreasuryPercent: number) {
    if (communityTreasuryPercent < 0 || communityTreasuryPercent > 100) {
      throw new Error("Provide valid percent value");
    }
    const token = this.tokenContract;
    await token.roles.grant("minter", this.voteContract.getAddress());
    const onwerBalance = Number(
      (await token.balanceOf(await sdk.wallet.getAddress())).displayValue
    );
    const communityTreasuryAmount =
      onwerBalance * (communityTreasuryPercent / 100);
    await token.transfer(
      this.voteContract.getAddress(),
      communityTreasuryAmount
    );
    console.log(
      "Transfered " + communityTreasuryAmount + " tokens to treasury"
    );
  }
  /**
   *  @param tokenAmountToMint How much tokens do you want to mint initially to your wallet wallet
   *  @param communityTreasuryPercent What percent of minted tokens you want to transfer to community treasury
   *  @param revokeRoles Do you want to revoke your admin role in token contract
   */
  async deploy(
    tokenAmountToMint = 10000,
    communityTreasuryPercent = 50,
    revokeRoles = true
  ) {
    const deployNfts = async () => {
      await this.deployMembershipContract();
      await this.initNFTMetadata();
      await this.setConditions();
    };
    const deployToken = async () => {
      await this.deployGovToken();
      await this.mintGovTokens(tokenAmountToMint);
      if (revokeRoles) await this.revokeAdminRoles();
    };
    const deployVote = async () => {
      await this.deployVoteContract();
      await this.setupVoteTreasury(communityTreasuryPercent);
    };
    await Promise.all([deployNfts(), deployToken()]);
    await deployVote();
    console.log(
      "Add this to REACT_APP_DROP_CONTRACT in .env file: " +
        this.nftContract.getAddress()
    );
    console.log(
      "Add this to REACT_APP_TOKEN_CONTRACT in .env file: " +
        this.tokenContract.getAddress()
    );
    console.log(
      "Add this to REACT_APP_VOTE_CONTRACT in .env file: " +
        this.voteContract.getAddress()
    );
    console.log("Call npm run airdrop to airdrop tokens to nft pass minters");
  }
}
