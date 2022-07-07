import { EditionDrop } from "@thirdweb-dev/sdk";
import { useState } from "react";

export default function MintButton(props) {
  const [isMining, setMiningStatus] = useState(false);
  const editionDrop: EditionDrop = props.editionDrop;
  const setMemberStatus = props.setMemberStatus;

  const mintNft = () => {
    editionDrop
      .claim(0, 1)
      .then(async (data) => {
        setMiningStatus(false);
        console.log(
          "TxHash: " +
            data.receipt.transactionHash +
            `\nCheck your nft: https://testnets.opensea.io/assets/${process.env.REACT_APP_DROP_CONTRACT}/0`
        );
        setMemberStatus(true);
      })
      .catch((err) => {
        console.error(err);
        setMiningStatus(false);
      });
    setMiningStatus(true);
  };

  return (
    <>
      {!isMining ? (
        <button className="mint-button" onClick={mintNft}>
          Mint NFT
        </button>
      ) : (
        <p>Waiting for transaction...</p>
      )}
    </>
  );
}
