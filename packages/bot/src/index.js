const dns = require('dns');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const Web3 = require('web3');
const bip39 = require('bip39');
const { Transaction } = require('@ethereumjs/tx');
const { default: Common } = require('@ethereumjs/common');
const { hdkey } = require('ethereumjs-wallet');

const { accessKeyId, secretAccessKey, treasuryMnemonic } =
require('fs').existsSync('./config.json') ? require('./config.json') : {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    treasuryMnemonic: process.env.treasuryMnemonic
  }

const { ethereumHost } = require('./constants.js');

const { makePromise } = require('./utilities.js');

const { devMode } = require("./devmode.js");

const { createDiscordClient } = require('./discordbot.js');
const { createTwitterClient } = require('./twitterBot.js');

Error.stackTraceLimit = 300;

const isMainnet = true;

// If dev mode is true, skip trying any AWS or Web3 calls

if (devMode) {
  console.warn("*** Warning: Important config variables not set");
  console.warn("*** Bot will start in dev mode");
}

let awsConfig, ddb, treasuryWallet, treasuryAddress = null;
if (!devMode) {
  awsConfig = new AWS.Config({
    credentials: new AWS.Credentials({
      accessKeyId,
      secretAccessKey,
    }),
    region: 'us-west-1',
  });

  ddb = new AWS.DynamoDB(awsConfig);

  treasuryWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  treasuryAddress = treasuryWallet.getAddressString();
}

(async () => {
  const ethereumHostAddress = await new Promise((accept, reject) => {
    dns.resolve4(ethereumHost, (err, addresses) => {
      if (!err) {
        if (addresses.length > 0) {
          accept(addresses[0]);
        } else {
          reject(new Error('no addresses resolved for ' + ethereumHostname));
        }
      } else {
        reject(err);
      }
    });
  });
  const gethNodeUrl = `http://${ethereumHostAddress}`;

  const web3 = new Web3(new Web3.providers.HttpProvider(gethNodeUrl + ':' + (isMainnet ? '8545' : '8546')));
  web3.eth.transactionConfirmationBlocks = 1;
  const fullAddresses = await fetch('https://contracts.webaverse.com/config/addresses.js')
    .then(res => res.text())
    .then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));
  const addresses = fullAddresses[isMainnet ? 'mainnetsidechain' : 'rinkebysidechain'];
  const abis = await fetch('https://contracts.webaverse.com/config/abi.js')
    .then(res => res.text())
    .then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));
  const contracts = await (async () => {
    console.log('got addresses', addresses);
    const result = {};
    [
      'Account',
      'FT',
      'NFT',
      'FTProxy',
      'NFTProxy',
      'Trade',
      'LAND',
      'LANDProxy',
    ].forEach(contractName => {
      result[contractName] = new web3.eth.Contract(abis[contractName], addresses[contractName]);
    });
    return result;
  })();

  const getStores = async () => {
    const numStores = await contracts.Trade.methods.numStores().call();
    const booths = [];
    for (let i = 0; i < numStores; i++) {
      const store = await contracts.Trade.methods.getStoreByIndex(i + 1).call();
      if (store.live) {
        const id = parseInt(store.id, 10);
        const seller = store.seller.toLowerCase();
        const tokenId = parseInt(store.tokenId, 10);
        const price = new web3.utils.BN(store.price);
        const entry = {
          id,
          seller,
          tokenId,
          price,
        };

        let booth = booths.find(booth => booth.seller === seller);
        if (!booth) {
          booth = {
            seller,
            entries: [],
          };
          booths.push(booth);
        }
        booth.entries.push(entry);
      }
    }
    return booths;
  };

  const txQueues = [];
  const runSidechainTransaction = mnemonic => {
    const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
    const address = wallet.getAddressString();

    const fn = async (contractName, method, ...args) => {
      let entry = txQueues[address];
      if (!entry) {
        entry = {
          running: false,
          cbs: [],
        };
        txQueues[address] = entry;
      }
      if (!entry.running) {
        entry.running = true;

        try {
          const txData = contracts[contractName].methods[method](...args);
          const data = txData.encodeABI();
          let gasPrice = await web3.eth.getGasPrice();
          gasPrice = parseInt(gasPrice, 10);

          const privateKey = wallet.getPrivateKeyString();
          const nonce = await web3.eth.getTransactionCount(address);
          const privateKeyBytes = Uint8Array.from(web3.utils.hexToBytes(privateKey));

          let tx = Transaction.fromTxData({
            to: contracts[contractName]._address,
            nonce: '0x' + new web3.utils.BN(nonce).toString(16),
            gasPrice: '0x' + new web3.utils.BN(gasPrice).toString(16),
            gasLimit: '0x' + new web3.utils.BN(8000000).toString(16),
            data,
          }, {
            common: Common.forCustomChain(
              'mainnet',
              {
                name: 'geth',
                networkId: 1,
                chainId: isMainnet ? 1338 : 1337,
              },
              'petersburg',
            ),
          }).sign(privateKeyBytes);
          const rawTx = '0x' + tx.serialize().toString('hex');

          const receipt = await web3.eth.sendSignedTransaction(rawTx);

          return receipt;
        } finally {
          entry.running = false;

          if (entry.cbs.length > 0) {
            entry.cbs.shift()();
          }
        }
      } else {
        const p = makePromise();
        entry.cbs.push(async () => {
          try {
            const result = await fn(contractName, method, ...args);
            p.accept(result);
          } catch (err) {
            p.reject(err);
          }
        });
        return await p;
      }
    };
    return fn;
  };

  createDiscordClient(web3, contracts, getStores, runSidechainTransaction, ddb, treasuryAddress, abis, fullAddresses);
  await createTwitterClient(web3, contracts, getStores, runSidechainTransaction, ddb, treasuryAddress);
  console.log("Bot started successfully");
})();

process.on('uncaughtException', err => {
  console.warn(err);
});
process.on('unhandledRejection', err => {
  console.warn(err);
});
