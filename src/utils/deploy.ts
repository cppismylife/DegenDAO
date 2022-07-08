import DeployScripts from "./scripts";

// Set how many dao governance tokens you want to mint initially to your wallet
// and what percent of minted amount you want to transfer to community treasury
new DeployScripts().deploy(10000, 50);
