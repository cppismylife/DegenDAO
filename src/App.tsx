import "./App.css";
import { useState, useEffect } from "react";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useEditionDrop,
  useNetwork,
  ChainId,
  useToken,
} from "@thirdweb-dev/react";
import MintButton from "./MintButton";
import Vote from "./Vote";
import HoldersList from "./HoldersList";
import ReadyProposals from "./ReadyProposals";

function App() {
  const [networkData, switchNetwork] = useNetwork();
  const address = useAddress();
  const connectMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const [isMember, setMemberStatus] = useState(false);
  const [maxSupply, setMaxSupply] = useState("0");
  const [remainingCount, setRemainingCount] = useState("0");
  const token = useToken(process.env.REACT_APP_TOKEN_CONTRACT);
  const editionDrop = useEditionDrop(process.env.REACT_APP_DROP_CONTRACT);

  useEffect(() => {
    (async () => {
      const { availableSupply, maxQuantity } =
        await editionDrop.claimConditions.getActive(0);
      setMaxSupply(maxQuantity);
      setRemainingCount(availableSupply);
    })();
  }, []);

  useEffect(() => {
    if (networkData.data.chain)
      if (networkData.data.chain.id !== ChainId.Rinkeby)
        switchNetwork(ChainId.Rinkeby);
    if (address) {
      editionDrop.balanceOf(address, 0).then((balance) => {
        if (balance.toNumber()) setMemberStatus(true);
        else setMemberStatus(false);
      });
    }
  }, [networkData, address, editionDrop]);

  if (!address) {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <button onClick={connectMetamask} className="connect-button">
              Connect Wallet
            </button>
          </div>
        </header>
        <main>
          <div className="App-main">
            <h1 className="main-title">Welcome to DegenDAO!</h1>
            <h3>Connect wallet to continue</h3>
          </div>
        </main>
      </div>
    );
  } else
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <div className="wallet-block">
              <p className="wallet">
                {address.slice(0, 4) + ".." + address.slice(address.length - 4)}
              </p>
              <p className="disconnect-button" onClick={disconnectWallet}>
                Disconnect
              </p>
            </div>
          </div>
        </header>
        <main>
          <div className="App-main">
            <h1 className="main-title">DegenDAO Dashboard</h1>
            {!isMember ? (
              <div style={{ width: "75vw" }}>
                <h3>
                  You are not yet a member of DegenDAO. Just mint a membership
                  nft to become a part of our community.
                  <br />
                  <span className="nft-left">
                    NFTs left:
                    {` ${remainingCount}/${maxSupply}`}
                  </span>
                </h3>
                <MintButton
                  editionDrop={editionDrop}
                  setMemberStatus={setMemberStatus}
                />
              </div>
            ) : (
              <div className={"dashboard-section flex-box"}>
                <div>
                  <HoldersList editionDrop={editionDrop} token={token} />
                  <ReadyProposals />
                </div>
                <Vote />
              </div>
            )}
          </div>
        </main>
      </div>
    );
}

export default App;
