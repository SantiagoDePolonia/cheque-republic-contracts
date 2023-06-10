import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
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
    scrollAlpha: {
      url: "https://scroll-alphanet.public.blastapi.io",
      accounts: {
        mnemonic: process.env.SEPOLIA_NETWORK_MNEMONIC,
      },
    },
    taiko: {
      url: "http://rpc.test.taiko.xyz",
      accounts: {
        mnemonic: process.env.SEPOLIA_NETWORK_MNEMONIC,
      },
    },
    optimism: {
      url: "https://endpoints.omniatech.io/v1/op/mainnet/public",
      accounts: {
        mnemonic: process.env.SEPOLIA_NETWORK_MNEMONIC,
      },
    },
    chiado: {
      url: "https://rpc.chiadochain.net",
      gasPrice: 1000000000,
      accounts: {
        mnemonic: process.env.SEPOLIA_NETWORK_MNEMONIC,
      },
    },
  },
  etherscan: {
    apiKey: {
      scrollAlpha: "abc",
    },
    customChains: [
      {
        network: "scrollAlpha",
        chainId: 534353,
        urls: {
          apiURL: "https://blockscout.scroll.io/api",
          browserURL: "https://blockscout.scroll.io/",
        },
      },
    ],
  },
};

export default config;
