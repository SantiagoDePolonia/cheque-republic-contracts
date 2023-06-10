import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: "https://rpc2.sepolia.org",
      accounts: {
        mnemonic: process.env.SEPOLIA_NETWORK_MNEMONIC,
      },
    },
  },
};

export default config;
