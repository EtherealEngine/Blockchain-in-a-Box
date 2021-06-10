const { accountKeys, zeroAddress, defaultAvatarPreview } = require('./constants.js');
const { getBlockchain, getPastEvents } = require('./blockchain.js');
const { STORAGE_HOST } = require("@blockchain-in-a-box/common/src/environment.js");

const _log = async (text, p) => {
  try {
    const r = await p;
    return r;
  } catch (err) {
    console.log('error pull', text, err);
  }
};

const _fetchAccountForMinter = async (tokenId, chainName) => {
  const {
    contracts,
  } = await getBlockchain();
  const address = await contracts[chainName].NFT.methods.getMinter(tokenId).call();
  if (address !== zeroAddress) {
    return await _fetchAccount(address, chainName);
  } else {
    return null;
  }
};
const _fetchAccountForOwner = async (tokenId, chainName) => {
  const {
    contracts,
  } = await getBlockchain();
  const address = await contracts[chainName].NFT.methods.ownerOf(tokenId).call();
  if (address !== zeroAddress) {
    return await _fetchAccount(address, chainName);
  } else {
    return null;
  }
};
const _fetchAccount = async (address, chainName) => {
  const {
    contracts,
  } = await getBlockchain();

  const [
    username,
    avatarPreview,
    monetizationPointer,
  ] = await Promise.all([
    (async () => {
      let username = await contracts[chainName].Account.methods.getMetadata(address, 'name').call();
      if (!username) {
        username = 'Anonymous';
      }
      return username;
    })(),
    (async () => {
      let avatarPreview = await contracts[chainName].Account.methods.getMetadata(address, 'avatarPreview').call();
      if (!avatarPreview) {
        avatarPreview = defaultAvatarPreview;
      }
      return avatarPreview;
    })(),
    (async () => {
      let monetizationPointer = await contracts[chainName].Account.methods.getMetadata(address, 'monetizationPointer').call();
      if (!monetizationPointer) {
        monetizationPointer = '';
      }
      return monetizationPointer;
    })(),
  ]);

  return {
    address,
    username,
    avatarPreview,
    monetizationPointer,
  };
};
const _filterByTokenId = tokenId => entry => {
  return parseInt(entry.returnValues.tokenId, 10) === tokenId;
};
const _cancelEntry = (deposits, withdraws, currentLocation, nextLocation, currentAddress) => {
  let candidateWithdrawIndex = -1, candidateDepositIndex = -1;
  withdraws.find((w, i) => {
    const candidateDeposit = deposits.find((d, i) => {
      if (d.returnValues['to'] === w.returnValues['from']) {
        candidateDepositIndex = i;
        return true;
      } else {
        return false;
      }
    });
    if (candidateDeposit) {
      candidateWithdrawIndex = i;
      return true;
    } else {
      return false;
    }
  });
  if (candidateWithdrawIndex !== -1 && candidateDepositIndex !== -1) {
    deposits.splice(candidateDepositIndex, 1);
    const withdraw = withdraws.splice(candidateWithdrawIndex, 1)[0];
    currentLocation = nextLocation;
    currentAddress = withdraw.returnValues['from'];

    return [
      deposits,
      withdraws,
      currentLocation,
      currentAddress,
    ];
  } else if (deposits.length > 0) {
    currentLocation += '-stuck';

    return [
      deposits,
      withdraws,
      currentLocation,
      currentAddress,
    ];
  } else {
    return null;
  }
};
const _cancelEntries = (mainnetDepositedEntries, mainnetWithdrewEntries, sidechainDepositedEntries, sidechainWithdrewEntries, polygonDepositedEntries, polygonWithdrewEntries, currentAddress) => {
  let currentLocation = 'mainnetsidechain';

  console.log('cancel entries', JSON.stringify({
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
  }, null, 2));

  // swap transfers
  {
    let changed = true;
    while (changed) {
      changed = false;

      console.log('loop start');

      // sidechain -> mainnet
      {
        const result = _cancelEntry(sidechainDepositedEntries, mainnetWithdrewEntries, currentLocation, 'mainnet', currentAddress);
        if (result && !/stuck/.test(result[2])) {
          sidechainDepositedEntries = result[0];
          mainnetWithdrewEntries = result[1];
          currentLocation = result[2];
          currentAddress = result[3];
          changed = true;

          console.log('sidechain -> mainnet', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));

          {
            const result2 = _cancelEntry(mainnetDepositedEntries, sidechainWithdrewEntries, currentLocation, 'mainnetsidechain', currentAddress);
            if (result2 && !/stuck/.test(result2[2])) {
              mainnetDepositedEntries = result2[0];
              sidechainWithdrewEntries = result2[1];
              currentLocation = result2[2];
              currentAddress = result2[3];
              changed = true;

              console.log('mainnet -> sidechain', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
                mainnetDepositedEntries: mainnetDepositedEntries.length,
                mainnetWithdrewEntries: mainnetWithdrewEntries.length,
                sidechainDepositedEntries: sidechainDepositedEntries.length,
                sidechainWithdrewEntries: sidechainWithdrewEntries.length,
                polygonDepositedEntries: polygonDepositedEntries.length,
                polygonWithdrewEntries: polygonWithdrewEntries.length,
              }));
            } else {
              console.log('mainnet -> sidechain', null, currentLocation, currentAddress, JSON.stringify({
                mainnetDepositedEntries: mainnetDepositedEntries.length,
                mainnetWithdrewEntries: mainnetWithdrewEntries.length,
                sidechainDepositedEntries: sidechainDepositedEntries.length,
                sidechainWithdrewEntries: sidechainWithdrewEntries.length,
                polygonDepositedEntries: polygonDepositedEntries.length,
                polygonWithdrewEntries: polygonWithdrewEntries.length,
              }));
            }
          }
        } else {
          console.log('sidechain -> mainnet', null, currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        }
      }

      // sidechain -> polygon
      {
        const result = _cancelEntry(sidechainDepositedEntries, polygonWithdrewEntries, currentLocation, 'polygon', currentAddress);
        if (result && !/stuck/.test(result[2])) {
          sidechainDepositedEntries = result[0];
          polygonWithdrewEntries = result[1];
          currentLocation = result[2];
          currentAddress = result[3];
          changed = true;

          console.log('sidechain -> polygon', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));

          const result2 = _cancelEntry(polygonDepositedEntries, sidechainWithdrewEntries, currentLocation, 'mainnetsidechain', currentAddress);
          if (result2 && !/stuck/.test(result2[2])) {
            polygonDepositedEntries = result2[0];
            sidechainWithdrewEntries = result2[1];
            currentLocation = result2[2];
            currentAddress = result2[3];
            changed = true;

            console.log('polygon -> sidechain', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
              mainnetDepositedEntries: mainnetDepositedEntries.length,
              mainnetWithdrewEntries: mainnetWithdrewEntries.length,
              sidechainDepositedEntries: sidechainDepositedEntries.length,
              sidechainWithdrewEntries: sidechainWithdrewEntries.length,
              polygonDepositedEntries: polygonDepositedEntries.length,
              polygonWithdrewEntries: polygonWithdrewEntries.length,
            }));
          } else {
            console.log('polygon -> sidechain', null, currentLocation, currentAddress, JSON.stringify({
              mainnetDepositedEntries,
              mainnetWithdrewEntries,
              sidechainDepositedEntries,
              sidechainWithdrewEntries,
              polygonDepositedEntries,
              polygonWithdrewEntries,
            }, null, 2));
          }
        } else {
          console.log('sidechain -> polygon', null, currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        }
      }
    }
    console.log('loop end');
  }
  // self transfer
  {
    let changed = true;
    while (changed) {
      changed = false;

      // sidechain -> sidechain
      {
        const result = _cancelEntry(sidechainDepositedEntries, sidechainWithdrewEntries, currentLocation, 'mainnetsidechain', currentAddress);
        if (result && !/stuck/.test(result[2])) {
          sidechainDepositedEntries = result[0];
          sidechainWithdrewEntries = result[1];
          changed = true;

          console.log('sidechain -> sidechain', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        } else {
          console.log('sidechain -> sidechain', null, currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        }
      }
      // mainnet -> mainnet
      {
        const result = _cancelEntry(mainnetDepositedEntries, mainnetWithdrewEntries, currentLocation, 'mainnet', currentAddress);
        if (result && !/stuck/.test(result[2])) {
          mainnetDepositedEntries = result[0];
          mainnetWithdrewEntries = result[1];
          changed = true;

          console.log('mainnet -> mainnet', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        } else {
          console.log('mainnet -> mainnet', null, currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        }
      }
      // polygon -> polygon
      {
        const result = _cancelEntry(polygonDepositedEntries, polygonWithdrewEntries, currentLocation, 'polygon', currentAddress);
        if (result && !/stuck/.test(result[2])) {
          polygonDepositedEntries = result[0];
          polygonWithdrewEntries = result[1];
          changed = true;

          console.log('polygon -> polygon', !/stuck/.test(result[2]), currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        } else {
          console.log('polygon -> polygon', null, currentLocation, currentAddress, JSON.stringify({
            mainnetDepositedEntries: mainnetDepositedEntries.length,
            mainnetWithdrewEntries: mainnetWithdrewEntries.length,
            sidechainDepositedEntries: sidechainDepositedEntries.length,
            sidechainWithdrewEntries: sidechainWithdrewEntries.length,
            polygonDepositedEntries: polygonDepositedEntries.length,
            polygonWithdrewEntries: polygonWithdrewEntries.length,
          }));
        }
      }
    }
  }
  if ([
    mainnetDepositedEntries,
    sidechainDepositedEntries,
    polygonDepositedEntries,
  ].some(depositedEntries => depositedEntries.length > 0)) {
    currentLocation += '-stuck';
  }

  return [
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
    currentLocation,
    currentAddress,
  ];
};

const formatToken = chainName => async (token, storeEntries, mainnetDepositedEntries, mainnetWithdrewEntries, sidechainDepositedEntries, sidechainWithdrewEntries, polygonDepositedEntries, polygonWithdrewEntries) => {
  const tokenId = parseInt(token.id, 10);
  const { name, ext, unlockable, hash } = token;

  const {
    contracts,
  } = await getBlockchain();

  const {
    sidechainChainName,
  } = getChainNames(chainName);

  let [
    minter,
    owner,
    description,
    sidechainMinterAddress,
  ] = await Promise.all([
    _log('formatToken 1' + JSON.stringify({ id: token.id }), _fetchAccountForMinter(tokenId, sidechainChainName)),
    _log('formatToken 2' + JSON.stringify({ id: token.id }), _fetchAccountForOwner(tokenId, sidechainChainName)),
    _log('formatToken 3' + JSON.stringify({ id: token.id }), contracts[sidechainChainName].NFT.methods.getMetadata(token.hash, 'description').call()),
    contracts[sidechainChainName].NFT.methods.getMinter(tokenId).call(),
  ]);

  const _filterByTokenIdLocal = _filterByTokenId(tokenId);
  mainnetDepositedEntries = mainnetDepositedEntries.filter(_filterByTokenIdLocal);
  mainnetWithdrewEntries = mainnetWithdrewEntries.filter(_filterByTokenIdLocal);
  sidechainDepositedEntries = sidechainDepositedEntries.filter(_filterByTokenIdLocal);
  sidechainWithdrewEntries = sidechainWithdrewEntries.filter(_filterByTokenIdLocal);
  polygonDepositedEntries = polygonDepositedEntries.filter(_filterByTokenIdLocal);
  polygonWithdrewEntries = polygonWithdrewEntries.filter(_filterByTokenIdLocal);

  const result = _cancelEntries(
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
    sidechainMinterAddress,
  );
  mainnetDepositedEntries = result[0];
  mainnetWithdrewEntries = result[1];
  sidechainWithdrewEntries = result[2];
  sidechainWithdrewEntries = result[3];
  polygonDepositedEntries = result[4];
  polygonWithdrewEntries = result[5];
  const currentLocation = result[6];
  sidechainMinterAddress = result[7];

  const storeEntry = storeEntries.find(entry => entry.tokenId === tokenId);
  const buyPrice = storeEntry ? storeEntry.price : null;
  const storeId = storeEntry ? storeEntry.id : null;
  const o = {
    id: tokenId,
    name,
    description,
    image: 'https://preview.exokit.org/' + hash + '.' + ext + '/preview.png',
    external_url: 'https://app.webaverse.com?h=' + hash,
    animation_url: `${STORAGE_HOST}/${hash}/preview.${ext === 'vrm' ? 'glb' : ext}`,
    properties: {
      name,
      hash,
      ext,
      unlockable,
    },
    minterAddress: minter.address.toLowerCase(),
    minter,
    ownerAddress: owner.address.toLowerCase(),
    owner,
    currentOwnerAddress: sidechainMinterAddress.toLowerCase(),
    balance: parseInt(token.balance, 10),
    totalSupply: parseInt(token.totalSupply, 10),
    buyPrice,
    storeId,
    currentLocation,
  };
  console.log('got token', JSON.stringify(o, null, 2));
  return o;
};

const _copy = o => {
  const oldO = o;
  // copy array
  const newO = JSON.parse(JSON.stringify(oldO));
  // decorate array
  for (const k in oldO) {
    newO[k] = oldO[k];
  }
  return newO;
};
const _isValidToken = token => token.owner !== zeroAddress;
const getChainNft = contractName => chainName => async (tokenId, storeEntries, mainnetDepositedEntries, mainnetWithdrewEntries, sidechainDepositedEntries, sidechainWithdrewEntries, polygonDepositedEntries, polygonWithdrewEntries) => {
  if (!storeEntries || !mainnetDepositedEntries || !mainnetWithdrewEntries || !sidechainDepositedEntries || !sidechainWithdrewEntries || !polygonDepositedEntries || !polygonWithdrewEntries) {
    console.warn('bad arguments were', {
      storeEntries,
      mainnetDepositedEntries,
      mainnetWithdrewEntries,
      sidechainDepositedEntries,
      sidechainWithdrewEntries,
      polygonDepositedEntries,
      polygonWithdrewEntries,
    });
    throw new Error('invalid arguments');
  }

  chainName = 'mainnetsidechain'; // XXX hack; get rid of this argument

  const {
    contracts,
  } = await getBlockchain();

  const [
    token,
  ] = await Promise.all([
    (async () => {
      const tokenSrc = await contracts[chainName][contractName].methods.tokenByIdFull(tokenId).call();
      const token = _copy(tokenSrc);
      const { hash } = token;
      token.unlockable = await contracts[chainName].NFT.methods.getMetadata(hash, 'unlockable').call();
      if (!token.unlockable) {
        token.unlockable = '';
      }
      return token;
    })(),
  ]);

  try {
    if (_isValidToken(token)) {
      if (contractName === 'NFT') {
        const r = await formatToken(chainName)(
          token,
          storeEntries,
          mainnetDepositedEntries,
          mainnetWithdrewEntries,
          sidechainDepositedEntries,
          sidechainWithdrewEntries,
          polygonDepositedEntries,
          polygonWithdrewEntries,
        );
        return r;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (err) {
    console.warn(err);
    return null;
  }
};
const getChainToken = getChainNft('NFT');
const getChainOwnerNft = contractName => chainName => async (address, i, storeEntries, mainnetDepositedEntries, mainnetWithdrewEntries, sidechainDepositedEntries, sidechainWithdrewEntries, polygonDepositedEntries, polygonWithdrewEntries) => {
  if (!storeEntries || !mainnetDepositedEntries || !mainnetWithdrewEntries || !sidechainDepositedEntries || !sidechainWithdrewEntries || !polygonDepositedEntries || !polygonWithdrewEntries) {
    console.warn('bad arguments were', {
      storeEntries,
      mainnetDepositedEntries,
      mainnetWithdrewEntries,
      sidechainDepositedEntries,
      sidechainWithdrewEntries,
      polygonDepositedEntries,
      polygonWithdrewEntries,
    });
    throw new Error('invalid arguments');
  }
  const { contracts } = await getBlockchain();

  const tokenSrc = await contracts[chainName][contractName].methods.tokenOfOwnerByIndexFull(address, i).call();
  const token = _copy(tokenSrc);
  const { hash } = token;
  token.unlockable = await contracts[chainName][contractName].methods.getMetadata(hash, 'unlockable').call();
  if (!token.unlockable) {
    token.unlockable = '';
  }

  try {
    if (contractName === 'NFT') {
      return await formatToken(chainName)(
        token,
        storeEntries,
        mainnetDepositedEntries,
        mainnetWithdrewEntries,
        sidechainDepositedEntries,
        sidechainWithdrewEntries,
        polygonDepositedEntries,
        polygonWithdrewEntries,
      );
    } else {
      return null;
    }
  } catch (err) {
    console.warn(err);
    return null;
  }
};
async function getChainAccount({
  address,
  chainName,
} = {}) {
  const { contracts } = await getBlockchain();
  const contract = contracts[chainName];

  const account = {
    address,
  };

  await Promise.all(accountKeys.map(async accountKey => {
    const accountValue = await contract.Account.methods.getMetadata(address, accountKey).call();
    account[accountKey] = accountValue;
  }));

  return account;
}

const getStoreEntries = async chainName => {
  const {
    contracts,
  } = await getBlockchain();

  const numStores = await contracts[chainName].Trade.methods.numStores().call();

  const promises = Array(numStores);

  for (let i = 0; i < numStores; i++) {
    promises[i] =
      contracts[chainName].Trade.methods.getStoreByIndex(i + 1)
        .call()
        .then(store => {
          if (store.live) {
            const id = parseInt(store.id, 10);
            const seller = store.seller.toLowerCase();
            const tokenId = parseInt(store.tokenId, 10);
            const price = parseInt(store.price, 10);
            return {
              id,
              seller,
              tokenId,
              price,
            };
          } else {
            return null;
          }
        });
  }
  let storeEntries = await Promise.all(promises);
  storeEntries = storeEntries.filter(store => store !== null);
  return storeEntries;
};
const getChainNames = chainName => {
  let mainnetChainName = chainName.replace(/polygon/, 'mainnet').replace(/sidechain/, '');
  if (mainnetChainName === '') {
    mainnetChainName = 'mainnet';
  }
  const sidechainChainName = mainnetChainName + 'sidechain';
  const polygonChainName = mainnetChainName.replace(/mainnet/, '') + 'polygon';
  return {
    mainnetChainName,
    sidechainChainName,
    polygonChainName,
  };
};
const getAllWithdrawsDeposits = contractName => async chainName => {
  const {
    mainnetChainName,
    sidechainChainName,
    polygonChainName,
  } = getChainNames(chainName);

  const [
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
  ] = await Promise.all([
    _log('getAllWithdrawsDeposits 1', getPastEvents({
      chainName: mainnetChainName,
      contractName: contractName + 'Proxy',
      eventName: 'Deposited',
      fromBlock: 0,
      toBlock: 'latest',
    })),
    _log('getAllWithdrawsDeposits 2', getPastEvents({
      chainName: mainnetChainName,
      contractName: contractName + 'Proxy',
      eventName: 'Withdrew',
      fromBlock: 0,
      toBlock: 'latest',
    })),
    _log('getAllWithdrawsDeposits 3', getPastEvents({
      chainName: sidechainChainName,
      contractName: contractName + 'Proxy',
      eventName: 'Deposited',
      fromBlock: 0,
      toBlock: 'latest',
    })),
    _log('getAllWithdrawsDeposits 4', getPastEvents({
      chainName: sidechainChainName,
      contractName: contractName + 'Proxy',
      eventName: 'Withdrew',
      fromBlock: 0,
      toBlock: 'latest',
    })),
    _log('getAllWithdrawsDeposits 5', getPastEvents({
      chainName: polygonChainName,
      contractName: contractName + 'Proxy',
      eventName: 'Deposited',
      fromBlock: 0,
      toBlock: 'latest',
    })),
    _log('getAllWithdrawsDeposits 6', getPastEvents({
      chainName: polygonChainName,
      contractName: contractName + 'Proxy',
      eventName: 'Withdrew',
      fromBlock: 0,
      toBlock: 'latest',
    })),
  ]);
  return {
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
  };
};

module.exports = {
  getChainNft,
  getChainAccount,
  getChainToken,
  getChainOwnerNft,
  getStoreEntries,
  getAllWithdrawsDeposits,
};