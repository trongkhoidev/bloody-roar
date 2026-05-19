require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./.env" });

// API keys loaded from environment — NEVER hardcode
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: INFURA_API_KEY
        ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
        : "https://rpc.sepolia.org",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : []
    }
  }
};
