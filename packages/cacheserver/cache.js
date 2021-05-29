const {getRedisItem, putRedisItem} = require('./redis.js');
const {getChainNft, getChainAccount, getAllWithdrawsDeposits} = require('./tokens.js');
const {nftKeys, nftPropertiesKeys, ids, redisPrefixes} = require('./constants.js');
const {getBlockchain, getPastEvents, makeWeb3WebsocketContract} = require('./blockchain.js');
const {connect, getRedisAllItems} = require('./redis.js');

async function initNftCache({chainName}) {
  const {
    web3,
    contracts,
    // wsContracts,
  } = await getBlockchain();

  await connect();

  const currentBlockNumber = await web3[chainName].eth.getBlockNumber();

  // Watch for new events.
  const _recurse = currentBlockNumber => {
    const wsContract = makeWeb3WebsocketContract(chainName, 'NFT');
    wsContract.events.allEvents({fromBlock: currentBlockNumber})
      .on('data', async function(event){
        console.log('nft event', chainName, event);
        
        currentBlockNumber = Math.max(currentBlockNumber, event.blockNumber);
        
        await processEventNft({
          event,
          chainName,
        });
      })
      /* .on('changed', async function(event){
        console.log('changed nft', chainName, event);
      })
      .on('error', async err => {
        console.warn('error nft', chainName, err);
      }); */
    wsContract.listener.on('error', async err => {
      console.warn('error nft listener', chainName, err);
    });
    wsContract.listener.on('end', async () => {
      console.log('reconnect nft listener', chainName);
      
      wsContract.listener.disconnect();
      
      // const currentBlockNumber = await web3[chainName].eth.getBlockNumber();
      _recurse(currentBlockNumber);
    });
  };
  _recurse(currentBlockNumber);

  let o = await getRedisItem(
    ids.lastCachedBlockNft,
    redisPrefixes[chainName + 'Nft']
  );
  const lastBlockNumber = o?.Item?.number || 0;

  // Catch up on missing blocks.
  if (currentBlockNumber !== lastBlockNumber) {
    const events = await getPastEvents({
      chainName,
      contractName: 'NFT',
      fromBlock: lastBlockNumber,
    });
    if (events.length > 0) {
      await processEventsNft({
        events,
        currentBlockNumber,
        chainName,
      });
    }
  }
}
async function initAccountCache({chainName}) {
  const {
    web3,
    contracts,
    // wsContracts,
  } = await getBlockchain();
  
  const currentBlockNumber = await web3[chainName].eth.getBlockNumber();
  
  // Watch for new events.
  const _recurse = currentBlockNumber => {
    const wsContract = makeWeb3WebsocketContract(chainName, 'Account');
    wsContract.events.allEvents({fromBlock: currentBlockNumber})
      .on('data', async function(event){
        console.log('account event', chainName, event);
        
        currentBlockNumber = Math.max(currentBlockNumber, event.blockNumber);
        
        await processEventAccount({
          event,
          chainName,
        });
      })
      /* .on('changed', async function(event){
        console.log('changed account', chainName, event);
      })
      .on('error', async err => {
        console.warn('error account', chainName, err);
        
        const currentBlockNumber = await web3[chainName].eth.getBlockNumber();
        _recurse(currentBlockNumber);
      }); */
    wsContract.listener.on('error', err => {
      console.warn('error account listener', chainName, err);
    });
    wsContract.listener.on('end', async () => {
      console.log('reconnect account listener', chainName);
      
      wsContract.listener.disconnect();
      
      // const currentBlockNumber = await web3[chainName].eth.getBlockNumber();
      _recurse(currentBlockNumber);
    });
  };
  _recurse(currentBlockNumber);

  const o = await getRedisItem(
    ids.lastCachedBlockAccount,
    redisPrefixes[chainName + 'Account']
  );
  const lastBlockNumber = o?.Item?.number || 0;

  // Catch up on missing blocks.
  if (currentBlockNumber !== lastBlockNumber) {
    const events = await getPastEvents({
      chainName,
      contractName: 'Account',
      fromBlock: lastBlockNumber,
    });
    if (events.length > 0) {
      await processEventsAccount({
        events,
        currentBlockNumber,
        chainName,
      });
    }
  }
}
async function initCaches() {
  const _logCache = async (name, p) => {
    console.log('started init cache', name);
    try {
      return await p;
    } catch(err) {
      console.warn('errored init cache', err);
      throw err;
    }
    console.log('finished init cache', name);
  };
  await Promise.all([
    'mainnet',
    'mainnetsidechain',
    'polygon',
  ].map(chainName => {
    return Promise.all([
      _logCache(chainName + ' NFT', initNftCache({chainName})),
      _logCache(chainName + ' Account', initAccountCache({chainName})),
    ]);
  }));
}

async function processEventNft({event, chainName}) {
  let {tokenId, hash, key, value} = event.returnValues;

  if (tokenId) {
    try {
      const storeEntries = [];
      const {
        mainnetDepositedEntries,
        mainnetWithdrewEntries,
        sidechainDepositedEntries,
        sidechainWithdrewEntries,
        polygonDepositedEntries,
        polygonWithdrewEntries,
      } = await getAllWithdrawsDeposits('NFT')(chainName);
      
      const token = await getChainNft('NFT')(chainName)(
        tokenId,
        storeEntries,
        mainnetDepositedEntries,
        mainnetWithdrewEntries,
        sidechainDepositedEntries,
        sidechainWithdrewEntries,
        polygonDepositedEntries,
        polygonWithdrewEntries,
      );

      if (token.owner.address !== '0x0000000000000000000000000000000000000000') {
        const tokenIdNum = parseInt(tokenId, 10);

        await putRedisItem(tokenIdNum, token, redisPrefixes.mainnetsidechainNft);
      }
    } catch (e) {
      console.error(e);
    }
  } else if (hash && key && value) {
    console.log('updating hash 1', {hash, key, value}, event.returnValues);
    
    const tokens = await getRedisAllItems(redisPrefixes[chainName + 'Nft']);
    const token = tokens.find(token => token.hash === hash);
    console.log('updating hash 2', token);
    if (token) {
      let updated = false;
      if (nftKeys.includes(key)) {
        token[key] = value;
        updated = true;
        
        /* // XXX fix this
        const params = {
          FilterExpression: "#hash = :hash",
          ExpressionAttributeNames: {
            "#hash": "hash",
          },
          ExpressionAttributeValues: {
            ':hash': hash,
          },
          TableName: redisPrefixes.mainnetsidechainNft,
          IndexName: 'hash-index',
        };
        const o = await ddbd.scan(params).promise();
        // console.log('got o', o);
        let tokens = o.Items;
        // console.log('updating hash 2', tokens);
        for (const token of tokens) {
          token[key] = value;
        }
        
        // console.log('updating hash 3', tokens);

        await Promise.all(tokens.map(token => {
          return putRedisItem(parseInt(token.id, 10), token, redisPrefixes.mainnetsidechainNft);
        }));
        
        // console.log('updating hash 4'); */
      }
      if (nftPropertiesKeys.includes(key)) {
        token.properties[key] = value;
        updated = true; 
      }
      if (updated) {
        await putRedisItem(token.id, token, redisPrefixes.mainnetsidechainNft);
      }
    } else {
      console.warn('could not find hash to update', token);
    }
  }

  const {blockNumber} = event;
  await putRedisItem(ids.lastCachedBlockNft, {
    id: ids.lastCachedBlockNft,
    number: blockNumber,
  }, redisPrefixes.mainnetsidechainNft);
}

async function processEventsNft({events, currentBlockNumber, chainName}) {
  const seenTokenIds = {};
  const tokenIds = events.map(event => {
    let {tokenId} = event.returnValues;
    if (typeof tokenId === 'string') {
      tokenId = parseInt(tokenId, 10);
      if (!seenTokenIds[tokenId]) {
        seenTokenIds[tokenId] = true;
        return tokenId;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }).filter(tokenId => tokenId !== null);

  console.log('process events', chainName, tokenIds.length);

  const storeEntries = [];
  const {
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
  } = await getAllWithdrawsDeposits('NFT')(chainName);
  for (const tokenId of tokenIds) {
    const token = await getChainNft('NFT')(chainName)(
      tokenId,
      storeEntries,
      mainnetDepositedEntries,
      mainnetWithdrewEntries,
      sidechainDepositedEntries,
      sidechainWithdrewEntries,
      polygonDepositedEntries,
      polygonWithdrewEntries,
    );

    if (token.owner.address !== '0x0000000000000000000000000000000000000000') {
      await putRedisItem(tokenId, token, redisPrefixes.mainnetsidechainNft);
    }
  }
  
  await putRedisItem(ids.lastCachedBlockNft, {
    id: ids.lastCachedBlockNft,
    number: currentBlockNumber,
  }, redisPrefixes.mainnetsidechainNft);
}

async function processEventAccount({contract, event, chainName}) {
  // console.log('got account event', event);
  let {owner} = event.returnValues;

  if (owner) {
    owner = owner.toLowerCase();
    try {
      const account = await getChainAccount({
        address: owner,
        chainName,
      });
      
      // console.log('load account into cache', owner, account);

      // if (token.properties.hash) {
        await putRedisItem(owner, account, redisPrefixes.mainnetsidechainAccount);
      // }
    } catch (e) {
      console.error(e);
    }
  }

  const {blockNumber} = event;
  await putRedisItem(ids.lastCachedBlockAccount, {number: blockNumber}, redisPrefixes.mainnetsidechainAccount);
}
const _uniquify = (a, pred = (a, b) => a === b) => {
  return a.filter((e, i) => {
    for (let j = 0; j < i; j++) {
      if (pred(a[j], e)) {
        return false;
      }
    }
    return true;
  });
};
async function processEventsAccount({contract, events, currentBlockNumber, chainName}) {
  let owners = events.map(e => {
    let {owner} = e.returnValues;
    owner = owner.toLowerCase();
    return owner;
  });
  owners = _uniquify(owners);

  for (const owner of owners) {
    const account = await getChainAccount({
      address: owner,
      chainName,
    });
    await putRedisItem(owner, account, redisPrefixes.mainnetsidechainAccount);
  }
  
  await putRedisItem(ids.lastCachedBlockAccount, {number: currentBlockNumber}, redisPrefixes.mainnetsidechainAccount);
}

module.exports = {
  initCaches,
};