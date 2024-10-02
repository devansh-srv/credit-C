require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();  // Add this line to load .env variables
// require("@nomiclabs/hardhat-ethers"); 

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: process.env.TESTNET_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY], 
    },
  },
};
