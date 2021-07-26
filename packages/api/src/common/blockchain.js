const events = require("events");
const { EventEmitter } = events;
const dns = require("dns");
const Web3 = require("web3");
const { hdkey } = require("ethereumjs-wallet");
const bip39 = require("bip39");
const { Transaction } = require("@ethereumjs/tx");
const Common = require ("@ethereumjs/common").default;

const addresses = require("../../config/addresses.js");
const abis = require("../../config/abi.js");
const ports = require("../../config/ports.js");

const { Sequelize, Model, DataTypes } = require("sequelize");
//const Sequelize = require('sequelize');

const sequelize = new Sequelize('dev', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
});
const { QueryTypes } = require('sequelize');


let web3,
  // web3socketProviders,
  web3sockets,
  contracts,
  // wsContracts,
  gethNodeUrl,
  gethNodeWSUrl,
  web3socketProviderUrls;

const BlockchainNetworks = [
  "mainnet",
  "mainnetsidechain",
  "polygon",
  "testnet",
  "testnetsidechain",
  "testnetpolygon",
];

const common = Common.forCustomChain(
  'mainnet',
  {
    name: 'geth',
    networkId: 1,
    chainId: 1337,
  },
  'petersburg',
);

const loadPromise = (async() => {
  const asyncGlobal = async() => {
    let data;
    try {
      data = await sequelize.query('SELECT DATA_KEY,DATA_VALUE FROM `ENVIRONMENT_DATA`', {type: sequelize.QueryTypes.SELECT});
    } catch (err) {
      console.log(err);
    }
    return data;
  };
  const globalData = await asyncGlobal();
  let ETHEREUM_HOST;
  let INFURA_PROJECT_ID;
  let POLYGON_VIGIL_KEY;
  for(let i of globalData){
    if (i.DATA_KEY=="ETHEREUM_HOST")
      ETHEREUM_HOST= i.DATA_VALUE;
      if (i.DATA_KEY=="INFURA_PROJECT_ID")
      INFURA_PROJECT_ID= i.DATA_VALUE;
      if (i.DATA_KEY=="POLYGON_VIGIL_KEY")
      POLYGON_VIGIL_KEY= i.DATA_VALUE;
  }
  console.log("in blockchain",ETHEREUM_HOST,INFURA_PROJECT_ID,POLYGON_VIGIL_KEY);
  const ethereumHostAddress =  await new Promise((accept, reject) => {
      dns.resolve4(ETHEREUM_HOST, (err, addresses) => {
        if (!err) {
          if (addresses.length > 0) {
            accept(addresses[0]);
          } else {
            reject(new Error("no addresses resolved for " + ETHEREUM_HOST));
          }
        } else {
          reject(err);
        }
      });
    }),
  gethNodeUrl = `http://${ethereumHostAddress}`;
  gethNodeWSUrl = `ws://${ethereumHostAddress}`;

  web3 = {
    mainnet: new Web3(
      new Web3.providers.HttpProvider(
        `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
      )
    ),
    mainnetsidechain: new Web3(
      new Web3.providers.HttpProvider(
        `${gethNodeUrl}:${ports.mainnetsidechain}`
      )
    ),

    testnet: new Web3(new Web3.providers.HttpProvider(
      `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`
    )),

    testnetsidechain: new Web3(new Web3.providers.HttpProvider(
      `${gethNodeUrl}:${ports.testnetsidechain}`
    )),

    polygon: new Web3(
      new Web3.providers.HttpProvider(
        `https://rpc-mainnet.maticvigil.com/v1/${POLYGON_VIGIL_KEY}`
      )
    ),
    testnetpolygon: new Web3(new Web3.providers.HttpProvider(
      `https://rpc-mumbai.maticvigil.com/v1/${POLYGON_VIGIL_KEY}`
    ))
  };

  // web3socketProviderUrls = {
  //   mainnet: `wss://mainnet.infura.io/ws/v3/${INFURA_PROJECT_ID}`,
  //   mainnetsidechain: `${gethNodeWSUrl}:${ports.mainnetsidechainWs}`,
  //   polygon: `wss://rpc-webverse-mainnet.maticvigil.com/v1/${POLYGON_VIGIL_KEY}`,
  // };
  contracts = {};
  BlockchainNetworks.forEach((network) => {
    contracts[network] = {
      Identity: new web3[network].eth.Contract(
        abis.Identity,
        addresses[network].Identity
      ),
      Currency: new web3[network].eth.Contract(abis.Currency, addresses[network].Currency),
      CurrencyProxy: new web3[network].eth.Contract(
        abis.CurrencyProxy,
        addresses[network].CurrencyProxy
      ),
      Inventory: new web3[network].eth.Contract(abis.Inventory, addresses[network].Inventory),
      InventoryProxy: new web3[network].eth.Contract(
        abis.InventoryProxy,
        addresses[network].InventoryProxy
      ),
      Trade: new web3[network].eth.Contract(
        abis.Trade,
        addresses[network].Trade
      ),
    };
  });
})();

async function getPastEvents({
  chainName,
  contractName,
  eventName = "allEvents",
  fromBlock = 0,
  toBlock = "latest",
} = {}) {
  try {
    const { contracts } = await getBlockchain();
    return await contracts[chainName][contractName].getPastEvents(eventName, {
      fromBlock,
      toBlock,
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getBlockchain() {
  await loadPromise;
  return {
    addresses,
    abis,
    web3,
    web3sockets,
    contracts,
    gethNodeUrl,
    gethNodeWSUrl,
    web3socketProviderUrls,
    // web3socketProviders,
    // wsContracts,
  };
}

function makeWeb3WebsocketContract(chainName, contractName) {
  const web3socketProvider = new Web3.providers.WebsocketProvider(
    web3socketProviderUrls[chainName]
  );
  const web3socket = new Web3(web3socketProvider);
  const web3socketContract = new web3socket.eth.Contract(
    abis[contractName],
    addresses[chainName][contractName]
  );

  web3socketProvider.on("error", (err) => {
    listener.emit("error", err);
  });
  web3socketProvider.on("end", () => {
    listener.emit("end");
  });

  const listener = new EventEmitter();
  listener.disconnect = () => {
    try {
      web3socketProvider.disconnect();
    } catch (err) {
      console.warn(err);
    }
  };
  web3socketContract.listener = listener;

  return web3socketContract;
}

const transactionQueue = {
  running: false,
  queue: [],
  lock() {
    if (!this.running) {
      this.running = true;
      return Promise.resolve();
    } else {
      const promise = makePromise();
      this.queue.push(promise.accept);
      return promise;
    }
  },
  unlock() {
    this.running = false;
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  },
};

const runSidechainTransaction = mnemonic => async (contractName, method, ...args) => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const wallet = hdkey.fromMasterSeed(seedBuffer).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();
  const privateKey = wallet.getPrivateKeyString();
  const privateKeyBytes = Uint8Array.from(web3['mainnetsidechain'].utils.hexToBytes(privateKey));

  const txData = contracts['mainnetsidechain'][contractName].methods[method](...args);
  const data = txData.encodeABI();
  const gas = await txData.estimateGas({
    from: address,
  });
  let gasPrice = await web3['mainnetsidechain'].eth.getGasPrice();
  gasPrice = parseInt(gasPrice, 10);

  await transactionQueue.lock();
  const nonce = await web3['mainnetsidechain'].eth.getTransactionCount(address);
  let tx = Transaction.fromTxData({
    to: contracts['mainnetsidechain'][contractName]._address,
    nonce: '0x' + new web3['mainnetsidechain'].utils.BN(nonce).toString(16),
    gas: '0x' + new web3['mainnetsidechain'].utils.BN(gas).toString(16),
    gasPrice: '0x' + new web3['mainnetsidechain'].utils.BN(gasPrice).toString(16),
    gasLimit: '0x' + new web3['mainnetsidechain'].utils.BN(8000000).toString(16),
    data,
  }, {
    common,
  }).sign(privateKeyBytes);
  const rawTx = '0x' + tx.serialize().toString('hex');
  // console.log('signed tx', tx, rawTx);
  const receipt = await web3['mainnetsidechain'].eth.sendSignedTransaction(rawTx);
  transactionQueue.unlock();
  return receipt;
};

module.exports = {
  getBlockchain,
  getPastEvents,
  makeWeb3WebsocketContract,
  runSidechainTransaction,
};
