require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  paths: {
    artifacts: "./app/src/artifacts",
  },
  networks: {
    hardhat: {
      // This is the default network configuration
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GEORLI_PRIVATE_KEY}`,
      accounts: [process.env.GOERLI_PRIVATE_KEY], // Make sure to set this environment variable
      gasPrice: 20000000000, // 20 Gwei
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_PRIVATE_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY], // Make sure to set this environment variable
      gasPrice: 20000000000, // 20 Gwei
    },
    // ... Add other networks like rinkeby, kovan, etc.
  },
};
