import sdk from "./initSdk";
import { ethers } from "ethers";

const voteContract = sdk.getVote(process.env.REACT_APP_VOTE_CONTRACT);
const tokenContract = sdk.getToken(process.env.REACT_APP_TOKEN_CONTRACT);
const nftContract = sdk.getEditionDrop(process.env.REACT_APP_DROP_CONTRACT);

const mintProposal = async () => {
  try {
    const amount = 1000;
    const description =
      "Propsal for minting addition 1000 $DEGEN tokens to treasury";
    const executions = [
      {
        toAddress: tokenContract.getAddress(),
        nativeTokenValue: 0,
        transactionData: tokenContract.encoder.encode("mintTo", [
          voteContract.getAddress(),
          ethers.utils.parseUnits(
            amount.toString(),
            (await tokenContract.get()).decimals
          ),
        ]),
      },
    ];
    await voteContract.propose(description, executions);
    console.log("Mint proposal created");
  } catch (error) {
    console.error("Failed to create mintProposal:\n" + error);
  }
};

const airdropProposal = async () => {
  const getArgs = async (amountToEachWallet: number) => {
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
      await tokenContract.balanceOf(voteContract.getAddress())
    ).value;
    if (minters) {
      if (totalAmountToTransfer.lte(airdropWalletBalance)) {
        const transferArgs = minters.map((address) => {
          return { amount: amountToEachWallet, toAddress: address };
        });
        return transferArgs;
      } else
        throw new Error(
          `Not enough tokens on airdrop wallet to transfer to all addresses. Need ${totalAmountToTransfer
            .sub(airdropWalletBalance)
            .div(String(10 ** 18))
            .toString()} more tokens`
        );
    } else throw new Error("No addresses to transfer");
  };
  try {
    const amount = 100;
    const decimals = (await tokenContract.get()).decimals;
    const description = "Propsal for airdrop 100 $DEGEN to DegenDAO members";
    const addresses = await getArgs(amount);
    const executions = addresses.map((element) => {
      return {
        toAddress: tokenContract.getAddress(),
        nativeTokenValue: 0,
        transactionData: tokenContract.encoder.encode("transfer", [
          element.toAddress,
          ethers.utils.parseUnits(element.amount.toString(), decimals),
        ]),
      };
    });
    await voteContract.propose(description, executions);
    console.log("Airdrop proposal created");
  } catch (error) {
    console.error("Failed to create airdrop proposal:\n" + error);
  }
};

const awardCEO = async () => {
  try {
    const description =
      "Proposal for awarding CEO of DegenDAO with 1000 $DEGEN";
    const decimals = (await tokenContract.get()).decimals;
    const executions = [
      {
        toAddress: tokenContract.getAddress(),
        nativeTokenValue: 0,
        transactionData: tokenContract.encoder.encode("transfer", [
          await sdk.wallet.getAddress(),
          ethers.utils.parseUnits("1000", decimals),
        ]),
      },
    ];
    voteContract.propose(description, executions);
    console.log("Award CEO proposal created");
  } catch (error) {
    console.error("Failed to create awarding CEO proposal");
  }
};

const sumbitProposals = async () => {
  mintProposal();
  // airdropProposal();
  // awardCEO();
};

sumbitProposals();
