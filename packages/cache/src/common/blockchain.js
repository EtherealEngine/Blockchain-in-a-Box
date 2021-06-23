const events = require("events");
const { EventEmitter } = events;
const dns = require("dns");
const Web3 = require("web3");
const {
  INFURA_PROJECT_ID,
  POLYGON_VIGIL_KEY,
  ETHEREUM_HOST,
} = require("./environment.js");

const addresses = require("../config/addresses.js");
const abis = require("../config/abi.js");
const ports = require("../config/ports.js");

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

const loadPromise = (async() => {
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

module.exports = {
  getBlockchain,
  getPastEvents,
  makeWeb3WebsocketContract,
};
