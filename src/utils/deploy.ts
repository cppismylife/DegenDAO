import DeployScripts from "./scripts";

// Set how many dao governance tokens do you want to mint initially to your wallet,
// what percent of minted amount do you want to transfer to community treasury and
// do you want to revoke your admin role in the end.
new DeployScripts().deploy(10000, 50, true);
