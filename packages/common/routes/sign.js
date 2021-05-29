const url = require('url');
const dns = require('dns');
// const util = require('util');
// const fs = require('fs');
// const {spawn} = require('child_process');
const fetch = require('node-fetch');
const Web3 = require('web3');
const bip39 = require('bip39');
const {hdkey} = require('ethereumjs-wallet');
const {_setCorsHeaders} = require('../utils.js');
const {
  POLYGON_VIGIL_KEY,
  MAINNET_MNEMONIC,
  TESTNET_MNEMONIC,
  POLYGON_MNEMONIC,
  TESTNET_POLYGON_MNEMONIC,
  INFURA_PROJECT_ID,
  ETHEREUM_HOST
} = require('../config.js');

const loadPromise = (async () => {
  const ethereumHostAddress = await new Promise((accept, reject) => {
    dns.resolve4(ETHEREUM_HOST, (err, addresses) => {
      if (!err) {
        if (addresses.length > 0) {
          accept(addresses[0]);
        } else {
          reject(new Error('no addresses resolved for ' + ETHEREUM_HOST));
        }
      } else {
        reject(err);
      }
    });
  });
  const gethNodeUrl = `http://${ethereumHostAddress}`;

  const web3 = {
    mainnet: new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`)),
    mainnetsidechain: new Web3(new Web3.providers.HttpProvider(gethNodeUrl + ':8545')),
    testnet: new Web3(new Web3.providers.HttpProvider(`https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`)),
    testnetsidechain: new Web3(new Web3.providers.HttpProvider(gethNodeUrl + ':8546')),
    polygon: new Web3(new Web3.providers.HttpProvider(`https://rpc-mainnet.maticvigil.com/v1/${POLYGON_VIGIL_KEY}`)),
    testnetpolygon: new Web3(new Web3.providers.HttpProvider(`https://rpc-mumbai.maticvigil.com/v1/${POLYGON_VIGIL_KEY}`)),
  };
  const addresses = await fetch('https://contracts.webaverse.com/config/addresses.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));
  const abis = await fetch('https://contracts.webaverse.com/config/abi.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));
  const chainIds = await fetch('https://contracts.webaverse.com/config/chain-id.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));
  const contracts = await (async () => {
    // console.log('got addresses', addresses);
    const result = {};
    [
      'mainnet',
      'mainnetsidechain',
      'testnet',
      'testnetsidechain',
      'polygon',
      'testnetpolygon',
    ].forEach(chainName => {
      [
        'Account',
        'FT',
        'NFT',
        'LAND',
        'FTProxy',
        'NFTProxy',
        'LANDProxy',
      ].forEach(contractName => {
        if (!result[chainName]) {
          result[chainName] = {};
        }
        result[chainName][contractName] = new web3[chainName].eth.Contract(abis[contractName], addresses[chainName][contractName]);
      });
    });
    return result;
  })();
  const wallets = {
    mainnet: hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(MAINNET_MNEMONIC)).derivePath(`m/44'/60'/0'/0/0`).getWallet(),
    mainnetsidechain: hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(MAINNET_MNEMONIC)).derivePath(`m/44'/60'/0'/0/0`).getWallet(),
    testnet: hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(TESTNET_MNEMONIC)).derivePath(`m/44'/60'/0'/0/0`).getWallet(),
    polygon: hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(POLYGON_MNEMONIC)).derivePath(`m/44'/60'/0'/0/0`).getWallet(),
    testnetpolygon: hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(TESTNET_POLYGON_MNEMONIC)).derivePath(`m/44'/60'/0'/0/0`).getWallet(),
  };

  return {
    web3,
    addresses,
    abis,
    chainIds,
    contracts,
    wallets,
  };
})();

const _handleSignRequest = async (req, res) => {
    // console.log('sign request', req.url);
    
    const {web3, addresses, chainIds, wallets} = await loadPromise;
    
    const request = url.parse(req.url);
    // const path = request.path.split('/')[1];

    try {
        res = _setCorsHeaders(res);
        const {method} = req;
        if (method === 'OPTIONS') {
            res.end();
        } else if (method === 'GET') {
            const match = request.path.match(/^\/(.+?)\/(.+?)\/(.+?)\/(.+?)$/);
            if (match) {
                const chainName = match[1];
                const contractName = match[2];
                const destinationChainName = match[3];
                const txid = match[4];
                const chainId = chainIds?.[chainName]?.[contractName];
                const destinationChainId = chainIds?.[destinationChainName]?.[contractName];
                // console.log('thick plot', {destinationChainId}, JSON.stringify(chainIds, null, 2), destinationChainName, contractName);
                if (typeof chainId === 'number' && typeof destinationChainId === 'number') {
                    try {
                      const txr = await web3[chainName].eth.getTransactionReceipt(txid);
                      const proxyContractName = contractName + 'Proxy';
                      // console.log('got txr', txr, txr.logs, txr.to.toLowerCase(), addresses[chainName][proxyContractName].toLowerCase());
                      if (txr && txr.to.toLowerCase() === addresses[chainName][proxyContractName].toLowerCase()) {
                        
                        const {logs} = txr;
                        // console.log('got txr logs', logs);
                        const log = logs.find(log =>
                          (contractName === 'FT' && log.topics[0] === '0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4') || // WebaverseERC20Proxy Deposited
                          (contractName === 'LAND' && log.topics[0] === '0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4') || // WebaverseERC721Proxy Deposited
                          (contractName === 'NFT' && log.topics[0] === '0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4') // WebaverseERC721Proxy Deposited
                        ) || null;
                        // console.log('got log', logs, log);
                        if (log) {
                          const wallet = wallets[destinationChainName];
                          // const proxyContractAddress = addresses[destinationChainName][proxyContractName];
                          
                          // const {returnValues} = log;
                          // const {from, to: toInverse} = returnValues;
                          const to = {
                            t: 'address',
                            v: '0x' + web3[destinationChainName].utils.padLeft(new web3[destinationChainName].utils.BN(log.topics[1].slice(2), 16), 40),
                          };
                          // signable
                          if (contractName === 'FT') {
                            const amount = {
                              t: 'uint256',
                              v: new web3[destinationChainName].utils.BN(log.topics[2].slice(2), 16),
                            };
                            const timestamp = {
                              t: 'uint256',
                              v: txid,
                            };
                            const chainId = {
                              t: 'uint256',
                              v: new web3[destinationChainName].utils.BN(chainIds[destinationChainName][contractName]),
                            };
                            const message = web3[destinationChainName].utils.encodePacked(to, amount, timestamp, chainId);
                            const hashedMessage = web3[destinationChainName].utils.sha3(message);
                            const sgn = web3[destinationChainName].eth.accounts.sign(hashedMessage, wallet.getPrivateKeyString());
                            // console.log('signed', sgn);
                            const {r, s, v} = sgn;
                            /* const r = sgn.slice(0, 66);
                            const s = '0x' + sgn.slice(66, 130);
                            const v = '0x' + sgn.slice(130, 132); */
                            // console.log('got', JSON.stringify({r, s, v}, null, 2));

                            res.end(JSON.stringify({
                              to: to.v,
                              amount: '0x' + web3[destinationChainName].utils.padLeft(amount.v.toString(16), 32),
                              timestamp: timestamp.v,
                              chainId: chainId.v.toNumber(),
                              r,
                              s,
                              v,
                            }));
                          } else if (contractName === 'NFT' || contractName === 'LAND') {
                            const tokenId = {
                              t: 'uint256',
                              v: new web3[destinationChainName].utils.BN(log.topics[2].slice(2), 16),
                            };
                            
                            // get sidechain deposit receipt signature
                            const timestamp = {
                              t: 'uint256',
                              v: txid,
                            };
                            const chainId = {
                              t: 'uint256',
                              v: new web3[destinationChainName].utils.BN(destinationChainId),
                            };

                            const message = web3[destinationChainName].utils.encodePacked(to, tokenId, timestamp, chainId);
                            const hashedMessage = web3[destinationChainName].utils.sha3(message);
                            const sgn = web3[destinationChainName].eth.accounts.sign(hashedMessage, wallet.getPrivateKeyString()); // await web3.eth.personal.sign(hashedMessage, address);
                            const {r, s, v} = sgn;
                            /* const r = sgn.slice(0, 66);
                            const s = '0x' + sgn.slice(66, 130);
                            const v = '0x' + sgn.slice(130, 132); */
                            // console.log('got', JSON.stringify({r, s, v}, null, 2));
                            res.end(JSON.stringify({
                              to: to.v,
                              tokenId: '0x' + web3[destinationChainName].utils.padLeft(tokenId.v.toString(16), 32),
                              timestamp: timestamp.v,
                              chainId: chainId.v.toNumber(),
                              r,
                              s,
                              v,
                            }));
                          } else {
                            res.end(JSON.stringify(null));
                          }
                        } else {
                          res.end(JSON.stringify(null));
                        }
                      } else {
                        res.statusCode = 404;
                        res.end();
                      }
                    } catch(err) {
                      console.warn(err);
                      res.statusCode = 404;
                      res.end();
                    }
                } else {
                    res.statusCode = 404;
                    res.end();
                }
            } else {
                res.statusCode = 404;
                res.end();
            }
        } else {
            res.statusCode = 404;
            res.end();
        }
    } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end(err.stack);
    }
}

/* const express = require('express');
const app = express();
app.all('*', _handleSignRequest);
app.listen(3002); */

module.exports = {
  _handleSignRequest,
};
