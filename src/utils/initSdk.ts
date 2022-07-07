import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import "dotenv/config";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.REACT_APP_RINKEBY_RPC_URL,
  "rinkeby"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const sdk = new ThirdwebSDK(wallet);

export default sdk;
