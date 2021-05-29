const dns = require('dns');
// const util = require('util');
// const fs = require('fs');
// const {spawn} = require('child_process');
const fetch = require('node-fetch');
const Web3 = require('web3');
const bip39 = require('bip39');
const {hdkey} = require('ethereumjs-wallet');
const {jsonParse, _setCorsHeaders} = require('../utils.js');
const {encodeSecret, decodeSecret} = require('../encryption.js');
const {MAX_SIZE} = require('../constants.js');

const {
  MAINNET_MNEMONIC,
  TESTNET_MNEMONIC,
  POLYGON_MNEMONIC,
  TESTNET_POLYGON_MNEMONIC,
  INFURA_PROJECT_ID,
  ENCRYPTION_MNEMONIC,
  POLYGON_VIGIL_KEY,
  STORAGE_HOST
} = require('../config.js');

const unlockableKey = 'unlockable';
const encryptedKey = 'encrypted';

let contracts = null;
const loadPromise = (async () => {
  const ETHEREUM_HOST = 'ethereum.exokit.org';

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
  contracts = await (async () => {
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

const proofOfAddressMessage = `Proof of address.`;
const _areAddressesColaborator = async (addresses, hash) => {
  let isC = false; // collaborator
  let isO1 = false; // owner on sidechain
  let isO2 = false; // owner on mainnet
  for (const address of addresses) {
    const [
      _isC,
      _isO1,
      _isO2,
    ] = await Promise.all([
      (async () => {
        try {
          const isC = await contracts.mainnetsidechain.NFT.methods.isCollaborator(hash, address).call();
          // console.log('got mainnetsidechain is c', {hash, address});
          return isC;
        } catch(err) {
          // console.warn(err);
          return false;
        }
      })(),
      (async () => {
        try {
          let owner = await contracts.mainnetsidechain.NFT.methods.ownerOf(id).call();
          owner = owner.toLowerCase();
          // console.log('got mainnetsidechain owner', {owner, id});
          return owner === address;
        } catch(err) {
          // console.warn(err);
          return false;
        }
      })(),
      (async () => {
        try {
          let owner = await contracts.mainnet.NFT.methods.ownerOf(id).call();
          owner = owner.toLowerCase();
          // console.log('got mainnet owner', {owner} );
          return owner === address;
        } catch(err) {
          // console.warn(err);
          return false;
        }
      })(),
    ]);
    // console.log('iterate address', {address, _isC, _isO1, _isO2});
    isC = isC || _isC;
    isO1 = isO1 || _isO1;
    isO2 = isO2 || _isO2;
  }
  
  // console.log('final addresses', {addresses, isC, isO1, isO2});
  
  return isC || isO1 || isO2;
};
const _areAddressesSingleColaborator = async (addresses, id) => {
  let isC = false; // collaborator
  let isO1 = false; // owner on sidechain
  let isO2 = false; // owner on mainnet
  for (const address of addresses) {
    const [
      _isC,
      _isO1,
      _isO2,
    ] = await Promise.all([
      (async () => {
        try {
          const isC = await contracts.mainnetsidechain.NFT.methods.isSingleCollaborator(id, address).call();
          // console.log('got mainnetsidechain is c', {hash, address});
          return isC;
        } catch(err) {
          // console.warn(err);
          return false;
        }
      })(),
      (async () => {
        try {
          let owner = await contracts.mainnetsidechain.NFT.methods.ownerOf(id).call();
          owner = owner.toLowerCase();
          // console.log('got mainnetsidechain owner', {owner, id});
          return owner === address;
        } catch(err) {
          // console.warn(err);
          return false;
        }
      })(),
      (async () => {
        try {
          let owner = await contracts.mainnet.NFT.methods.ownerOf(id).call();
          owner = owner.toLowerCase();
          // console.log('got mainnet owner', {owner} );
          return owner === address;
        } catch(err) {
          // console.warn(err);
          return false;
        }
      })(),
    ]);
    // console.log('iterate address', {address, _isC, _isO1, _isO2});
    isC = isC || _isC;
    isO1 = isO1 || _isO1;
    isO2 = isO2 || _isO2;
  }
  
  // console.log('final addresses', {addresses, isC, isO1, isO2});
  
  return isC || isO1 || isO2;
};
const _handleUnlockRequest = async (req, res) => {
    // console.log('unlock request', req.url);
    
    const {web3, contracts} = await loadPromise;
    
    try {
        res = _setCorsHeaders(res);
        const {method} = req;
        if (method === 'OPTIONS') {
            res.end();
        } else if (method === 'POST') {
            const j = await new Promise((accept, reject) => {
              const bs = [];
              let totalSize = 0;
              const _data = d => {
                totalSize += d.byteLength;
                if (totalSize < MAX_SIZE) {
                  bs.push(d);
                } else {
                  reject(new Error('request too large'));
                  _cleanup();
                }
              };
              const _end = () => {
                const b = Buffer.concat(bs);
                const s = b.toString('utf8');
                const j = JSON.parse(s);
                accept(j);
              };
              const _cleanup = () => {
                req.removeListener('data', _data);
                req.removeListener('end', _end);
              };
              req.on('data', _data);
              req.on('end', _end);
              req.on('error', reject);
            });
            const {signatures, id} = j;
            // console.log('got j', j);
            const key = unlockableKey;
            // console.log('got sig', {signatures, id});
            const addresses = [];
            let ok = true;
            for (const signature of signatures) {
              try {
                let address = await web3.mainnetsidechain.eth.accounts.recover(proofOfAddressMessage, signature);
                address = address.toLowerCase();
                addresses.push(address);
              } catch(err) {
                console.warn(err.stack);
                ok = false;
              }
            }
            
            // console.log('got sig 2', addresses);
            if (ok) {
              const hash = await contracts.mainnetsidechain.NFT.methods.getHash(id).call();
              const isCollaborator = await _areAddressesColaborator(addresses, hash);
              if (isCollaborator) {
                let value = await contracts.mainnetsidechain.NFT.methods.getMetadata(hash, key).call();
                // console.log('pre value', {value});
                value = jsonParse(value);
                // console.log('final value', {value});
                if (value !== null && typeof value.ciphertext === 'string' && typeof value.tag === 'string') {
                  let {ciphertext, tag} = value;
                  ciphertext = Buffer.from(ciphertext, 'base64');
                  tag = Buffer.from(tag, 'base64');
                  // console.log('got ciphertext 1', {ciphertext, tag});
                  value = decodeSecret(ENCRYPTION_MNEMONIC, id, {ciphertext, tag}, 'utf8');
                  // console.log('got ciphertext 2', {ciphertext, tag, value});
                }

                res.end(JSON.stringify({
                  ok: true,
                  result: value,
                }));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify({
                  ok: false,
                  result: null,
                }));
              }
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({
                ok: false,
                result: null,
              }));
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
};
const _handleLockRequest = async (req, res) => {
    // console.log('unlock request', req.url);

    try {
        res = _setCorsHeaders(res);
        const {method} = req;
        if (method === 'OPTIONS') {
            res.end();
        } else if (method === 'POST') {
            let match, id;

            if ((match = req.url.match(/^\/([0-9]+)$/)) && !isNaN(id = match && parseInt(match[1], 10))) {
              // console.log('do set', id, key, value);

              const b = await new Promise((accept, reject) => {
                const bs = [];
                let totalSize = 0;
                const _data = d => {
                  totalSize += d.byteLength;
                  if (totalSize < MAX_SIZE) {
                    bs.push(d);
                  } else {
                    reject(new Error('request too large'));
                    _cleanup();
                  }
                };
                const _end = () => {
                  const b = Buffer.concat(bs);
                  accept(b);
                };
                const _cleanup = () => {
                  req.removeListener('data', _data);
                  req.removeListener('end', _end);
                };
                req.on('data', _data);
                req.on('end', _end);
                req.on('error', reject);
              });

              let {ciphertext, tag} = encodeSecret(ENCRYPTION_MNEMONIC, id, b);
              // ciphertext = ciphertext.toString('base64');
              tag = tag.toString('base64');
              /* value = JSON.stringify({
                ciphertext,
                tag,
              }); */
              
              res.setHeader('Content-Type', 'application/octet-stream');
              res.setHeader('tag', tag);
              res.end(ciphertext);
            } else {
              res.statusCode = 400;
              res.end('invalid id');
            }
        } else {
            res.statusCode = 404;
            res.end('not found');
        }
    } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end(err.stack);
    }
};
const _handleDecryptRequest = async (req, res) => {
    // console.log('unlock request', req.url);
    
    const {web3, contracts} = await loadPromise;

    try {
        res = _setCorsHeaders(res);
        const {method} = req;
        if (method === 'OPTIONS') {
            res.end();
        } else if (method === 'POST') {
            const j = await new Promise((accept, reject) => {
              const bs = [];
              let totalSize = 0;
              const _data = d => {
                totalSize += d.byteLength;
                if (totalSize < MAX_SIZE) {
                  bs.push(d);
                } else {
                  reject(new Error('request too large'));
                  _cleanup();
                }
              };
              const _end = () => {
                const b = Buffer.concat(bs);
                const s = b.toString('utf8');
                const j = jsonParse(s);
                accept(j);
              };
              const _cleanup = () => {
                req.removeListener('data', _data);
                req.removeListener('end', _end);
              };
              req.on('data', _data);
              req.on('end', _end);
              req.on('error', reject);
            });
            const {signatures, id} = j || {};
            
            if (Array.isArray(signatures) && signatures.every(signature => typeof signature === 'string') && typeof id === 'number') {
              // console.log('got j', j);
              const key = encryptedKey;
              // console.log('got sig', {signatures, id});
              const addresses = [];
              let ok = true;
              for (const signature of signatures) {
                try {
                  let address = await web3.mainnetsidechain.eth.accounts.recover(proofOfAddressMessage, signature);
                  address = address.toLowerCase();
                  addresses.push(address);
                } catch(err) {
                  console.warn(err.stack);
                  ok = false;
                }
              }
              
              // console.log('got sig 2', addresses);
              if (ok) {
                const hash = await contracts.mainnetsidechain.NFT.methods.getHash(id).call();
                const isCollaborator = await _areAddressesColaborator(addresses, hash);
                if (isCollaborator) {
                  let value = await contracts.mainnetsidechain.NFT.methods.getMetadata(hash, key).call();
                  // console.log('pre value', {value});
                  value = jsonParse(value);
                  // console.log('final value', {value});
                  if (value !== null && typeof value.cipherhash === 'string' && typeof value.tag === 'string') {
                    let {cipherhash, tag} = value;
                    
                    const ciphertext = await (async () => {
                      const res = await fetch(`${STORAGE_HOST}/ipfs/${cipherhash}`);
                      const b = await res.buffer();
                      return b;
                    })();

                    tag = Buffer.from(tag, 'base64');
                    // console.log('got ciphertext 1', {ciphertext, tag});
                    const plaintext = decodeSecret(ENCRYPTION_MNEMONIC, id, {ciphertext, tag}, null);
                    // console.log('got ciphertext 2', {ciphertext, tag, value});
                    
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.end(plaintext);
                  } else {
                    res.statusCode = 500;
                    res.end('could not interpret ciphertext for decryption: ' + JSON.stringify(value));
                  }
                } else {
                  res.statusCode = 401;
                  res.end('not a collaborator');
                }
              } else {
                res.statusCode = 400;
                res.end('signatures invalid');
              }
            } else {
              res.statusCode = 400;
              res.end('invalid arguments');
            }
        } else {
            res.statusCode = 404;
            res.end('not found');
        }
    } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end(err.stack);
    }
};
const _isCollaborator = async (tokenId, address) => {
  const hash = await contracts.mainnetsidechain.NFT.methods.getHash(tokenId).call();
  return await _areAddressesColaborator([address], hash);
};
const _isSingleCollaborator = async (tokenId, address) => await _areAddressesSingleColaborator([address], tokenId);

module.exports = {
  _handleUnlockRequest,
  _handleLockRequest,
  _handleDecryptRequest,
  _isCollaborator,
  _isSingleCollaborator,
};
