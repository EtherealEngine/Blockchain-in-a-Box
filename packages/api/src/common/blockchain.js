const events = require("events");
const { EventEmitter } = events;
const dns = require("dns");
const Web3 = require("web3");
const { hdkey } = require("ethereumjs-wallet");
const bip39 = require("bip39");
const { Transaction } = require("@ethereumjs/tx");
const Common = require ("@ethereumjs/common").default;

//const addresses = require("../../config/addresses.js");
const abis = require("../../config/abi.js");
const ports = require("../../config/ports.js");

const network = process.env.PRODUCTION ? "mainnetsidechain" : "testnetsidechain";
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('dev', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
});

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
    chainId: 33,
  },
  'petersburg',
);

const loadPromise = (async() => {
  const asyncGlobal = async() => {
    let data;
    try {
      data = await sequelize.query('SELECT dataKey,dataValue FROM `ENVIRONMENT_DATA`', {type: sequelize.QueryTypes.SELECT});
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
    if (i.dataKey=="ETHEREUM_HOST")
      ETHEREUM_HOST= i.dataValue;
      if (i.dataKey=="INFURA_PROJECT_ID")
      INFURA_PROJECT_ID= i.dataValue;
      if (i.dataKey=="POLYGON_VIGIL_KEY")
      POLYGON_VIGIL_KEY= i.dataValue;
  }

  const asyncAddress = async() => {
    let data;
    try {
      data = await sequelize.query('SELECT identityValue,currencyValue,inventoryValue,currencyProxyValue,inventoryProxyValue,tradeValue FROM `ADDRESS_DATA` WHERE networkType=?', {type: sequelize.QueryTypes.SELECT,replacements: [network]});
    } catch (err) {
      console.log(err);
    }
    return data;
  };
  const addressData = await asyncAddress();
  let IDENTITY_ADDRESS = addressData[0]['identityValue'];
  let CURRENCY_ADDRESS = addressData[0]['currencyValue'];
  let CURRENCYPROXY_ADDRESS = addressData[0]['currencyProxyValue'];
  let INVENTORY_ADDRESS = addressData[0]['inventoryValue'];
  let INVENTORYPROXY_ADDRESS = addressData[0]['inventoryProxyValue'];
  let TRADE_ADDRESS = addressData[0]['tradeValue'];

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
  console.log("gethNodeUrl",gethNodeUrl);
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
      //`https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`
      `${gethNodeUrl}`
    )),

    testnetsidechain: new Web3(new Web3.providers.HttpProvider(
      //`${gethNodeUrl}:${ports.testnetsidechain}`
      `${gethNodeUrl}`
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
  contracts[network] = {
    Identity: new web3[network].eth.Contract(
      abis.Identity,
      IDENTITY_ADDRESS
    ),
    Currency: new web3[network].eth.Contract(
      abis.Currency, 
      CURRENCY_ADDRESS
    ),
    CurrencyProxy: new web3[network].eth.Contract(
      abis.CurrencyProxy,
      CURRENCYPROXY_ADDRESS
    ),
    Inventory: new web3[network].eth.Contract(
      abis.Inventory, 
      INVENTORY_ADDRESS
    ),
    InventoryProxy: new web3[network].eth.Contract(
      abis.InventoryProxy,
      INVENTORYPROXY_ADDRESS
    ),
    Trade: new web3[network].eth.Contract(
      abis.Trade,
      TRADE_ADDRESS
    ),
  };
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
    //addresses,
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

/*
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
*/

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

const runSidechainWalletTransaction = mnemonic => async (toUserAddress,amount) => {
  
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const wallet = hdkey.fromMasterSeed(seedBuffer).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();
  //const address = '0xf90c251e42367a6387afecba10b95c97eaf3b287';
  const privateKey = wallet.getPrivateKeyString();
  //const privateKey = '0xd99643dec67c96c08d65afe3d2c6a4e6da4e2717cc99fb155096d9f2f4a4434b';
  const privateKeyBytes = Uint8Array.from(web3[network].utils.hexToBytes(privateKey));
   
  //const txData = contracts[network][contractName].methods[method](...args);
  //const data = txData.encodeABI();
  var balance =await web3[network].eth.getBalance(address);
  var gas=300000;
/*
  try{
    gas = await txData.estimateGas({from: address});
} catch (err) {
  console.warn(err);
  null;
}*/
  //let _to = contracts[network][contractName]._address;
  let gasPrice = await web3[network].eth.getGasPrice();
  gasPrice = parseInt(gasPrice, 10);
  console.log("network---",network,"from address---",address,"to address---",toUserAddress,"amount---",amount,"gasPrice---",gasPrice,"gas---",gas,"total---",gas*gasPrice);
  //await transactionQueue.lock();
  const nonce = await web3[network].eth.getTransactionCount(address);
  
  let tx = Transaction.fromTxData({
    /*from: address,*/
    to: toUserAddress,
    value: amount,
    nonce: '0x' + new web3[network].utils.BN(nonce).toString(16),
    gas: '0x' + new web3[network].utils.BN(gas).toString(16),
    gasPrice: '0x' + new web3[network].utils.BN(gasPrice).toString(16),
    gasLimit: '0x' + new web3[network].utils.BN(0x47b760).toString(16),
    //data,
  },{
    common: Common.forCustomChain(
      'mainnet',
      {
        name: 'geth',
        networkId: '*',
        chainId: 33,
      },
      'byzantium',
    ),
  }).sign(privateKeyBytes);
  const rawTx = '0x' + tx.serialize().toString('hex');
  console.log("rawTx",rawTx);
  const receipt = await web3[network].eth.sendSignedTransaction(rawTx);
  console.log("receipt",receipt);
  //transactionQueue.unlock();
  return receipt;
};

const runSidechainTransaction = mnemonic => async (contractName, method, ...args) => {
  
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const wallet = hdkey.fromMasterSeed(seedBuffer).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  console.log(contractName,method);
  const address = wallet.getAddressString();
  //const address = '0xf90c251e42367a6387afecba10b95c97eaf3b287';
  const privateKey = wallet.getPrivateKeyString();
  //const privateKey = '0xd99643dec67c96c08d65afe3d2c6a4e6da4e2717cc99fb155096d9f2f4a4434b';
  const privateKeyBytes = Uint8Array.from(web3[network].utils.hexToBytes(privateKey));
   
  const txData = contracts[network][contractName].methods[method](...args);
  const data = txData.encodeABI();
  var balance =await web3[network].eth.getBalance(address);
  var gas;

  try{
    gas = await txData.estimateGas({from: address});
} catch (err) {
  console.warn(err);
  null;
}
  let _to = contracts[network][contractName]._address;
  let gasPrice = await web3[network].eth.getGasPrice();
  gasPrice = parseInt(gasPrice, 10);
  console.log("network---",network,"from address---",address,"to address---",_to,"balance---",balance,"contract address---",contracts[network][contractName]._address,"gasPrice---",gasPrice,"gas---",gas,"total---",gas*gasPrice);
  //await transactionQueue.lock();
  const nonce = await web3[network].eth.getTransactionCount(address);
  
  let tx = Transaction.fromTxData({
    from: address,
    to: _to,
    nonce: '0x' + new web3[network].utils.BN(nonce).toString(16),
    gas: '0x' + new web3[network].utils.BN(gas).toString(16),
    gasPrice: '0x' + new web3[network].utils.BN(gasPrice).toString(16),
    gasLimit: '0x' + new web3[network].utils.BN(0x47b760).toString(16),
    data,
  },{
    common: Common.forCustomChain(
      'mainnet',
      {
        name: 'geth',
        networkId: '*',
        chainId: 33,
      },
      'byzantium',
    ),
  }).sign(privateKeyBytes);
  const rawTx = '0x' + tx.serialize().toString('hex');
  const receipt = await web3[network].eth.sendSignedTransaction(rawTx);
  //transactionQueue.unlock();
  return receipt;
};

module.exports = {
  getBlockchain,
  getPastEvents,
  //makeWeb3WebsocketContract,
  runSidechainTransaction,
  runSidechainWalletTransaction,
};