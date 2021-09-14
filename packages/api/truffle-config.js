const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

// TODO: Replace dotenv with mysql calls

module.exports = {
  contracts_directory: "./contracts",
  networks: {
    /*
    development: {
      host: "a42f3ac8ef865438ca0b99bd673f4e70-871205895.us-west-1.elb.amazonaws.com", // Localhost (default: none)
      port: 80, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
      timeoutBlocks: 20000,
      networkCheckTimeout: 200000,
    },*/
    
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    testnet: {
      host: "localhost",
      provider: () =>
        new HDWalletProvider(
          process.env.testnet,
          "https://rinkeby.infura.io/v3/" + process.env.INFURA_PROJECT_ID
        ),
      network_id: 4,
      gas: 4612388,
      gasPrice: 10000000000,
    },
    testnetsidechain: {
      host: process.env.TESTNET_SIDECHAIN_URL,
      provider: () =>
        new HDWalletProvider(
          process.env.mainnetsidechain,
          "http://" + process.env.TESTNET_SIDECHAIN_URL
        ),
      port: 8486,
      network_id: "1337",
    },
    testnetpolygon: {
      provider: () =>
        new HDWalletProvider(
          process.env.testnetpolygon,
          `https://rpc-mumbai.matic.today`
        ),
      network_id: 80001,
      confirmations: 1,
      timeoutBlocks: 500,
      networkCheckTimeout: 20000,
      skipDryRun: true,
    },
    mainnet: {
      host: "", // TODO: Add me
      provider: () => new HDWalletProvider(process.env.mainnet, ""),
      port: 8485,
      network_id: "1338",
      networkCheckTimeout: 10000,
    },
    mainnetsidechain: {
      host: process.env.MAINNET_SIDECHAIN_URL,
      provider: () =>
        new HDWalletProvider(
          process.env.mainnetsidechain,
          "http://" +  process.env.MAINNET_SIDECHAIN_URL
        ),
      port: 8485,
      network_id: "1338",
      networkCheckTimeout: 10000,
    },
    polygon: {
      provider: () =>
        new HDWalletProvider(
          process.env.polygon,
          `https://rpc-mainnet.polygon.network`
        ),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      networkCheckTimeout: 10000,
      skipDryRun: false,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.5",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1500,
        },
        evmVersion: "byzantium"
      },
    },
  },
};
