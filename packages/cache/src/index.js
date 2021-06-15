const {
  getChainAsset,
  getChainIdentity,
  getAllWithdrawsDeposits,
} = require("@blockchain-in-a-box/common/src/tokens.js");
const {
  assetKeys,
  assetPropertiesKeys,
  ids,
  redisPrefixes,
} = require("@blockchain-in-a-box/common/src/constants.js");
const {
  getBlockchain,
  getPastEvents,
  makeWeb3WebsocketContract,
} = require("@blockchain-in-a-box/common/src/blockchain.js");
const {
  connect,
  getRedisAllItems,
  getRedisItem,
  putRedisItem,
} = require("@blockchain-in-a-box/common/src/redis.js");

initCaches();

async function initializeAssetCache({ chainName }) {
  const { web3 } = await getBlockchain();

  await connect(process.env.REDIS_PORT, process.env.REDIS_HOST);

  const currentBlockNumber = await web3[chainName].eth.getBlockNumber();

  // Watch for new events.
  const recursivelyProcessEvents = (currentBlockNumber) => {
    const wsContract = makeWeb3WebsocketContract(chainName, "ASSET");
    wsContract.events
      .allEvents({ fromBlock: currentBlockNumber })
      .on("data", async function (event) {
        console.log("Asset event", chainName, event);

        currentBlockNumber = Math.max(currentBlockNumber, event.blockNumber);

        await processEventAsset({
          event,
          chainName,
        });
      });
    wsContract.listener.on("error", async (err) => {
      console.warn("Error Asset listener", chainName, err);
    });
    wsContract.listener.on("end", async () => {
      console.log("Reconnect Asset listener", chainName);

      wsContract.listener.disconnect();
      recursivelyProcessEvents(currentBlockNumber);
    });
  };
  recursivelyProcessEvents(currentBlockNumber);

  let o = await getRedisItem(
    ids.lastCachedBlockAsset,
    redisPrefixes[chainName + "Asset"]
  );
  const lastBlockNumber = o?.Item?.number || 0;

  // Catch up on missing blocks.
  if (currentBlockNumber !== lastBlockNumber) {
    const events = await getPastEvents({
      chainName,
      contractName: "ASSET",
      fromBlock: lastBlockNumber,
    });
    if (events.length > 0) {
      await processEventsAsset({
        events,
        currentBlockNumber,
        chainName,
      });
    }
  }
}

async function initAccountCache({ chainName }) {
  const { web3 } = await getBlockchain();

  const currentBlockNumber = await web3[chainName].eth.getBlockNumber();

  // Watch for new events.
  const _recurse = (currentBlockNumber) => {
    const wsContract = makeWeb3WebsocketContract(chainName, "Identity");
    wsContract.events
      .allEvents({ fromBlock: currentBlockNumber })
      .on("data", async function (event) {
        console.log("account event", chainName, event);

        currentBlockNumber = Math.max(currentBlockNumber, event.blockNumber);

        await processEventAccount({
          event,
          chainName,
        });
      });
    wsContract.listener.on("error", (err) => {
      console.warn("error account listener", chainName, err);
    });
    wsContract.listener.on("end", async () => {
      console.log("reconnect account listener", chainName);

      wsContract.listener.disconnect();

      _recurse(currentBlockNumber);
    });
  };
  _recurse(currentBlockNumber);

  const o = await getRedisItem(
    ids.lastCachedBlockAccount,
    redisPrefixes[chainName + "Identity"]
  );
  const lastBlockNumber = o?.Item?.number || 0;

  // Catch up on missing blocks.
  if (currentBlockNumber !== lastBlockNumber) {
    const events = await getPastEvents({
      chainName,
      contractName: "Identity",
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
  const logCache = async (name, p) => {
    console.log("started init cache", name);
    try {
      return await p;
    } catch (err) {
      console.warn("errored init cache", err);
      throw err;
    }
  };
  await Promise.all(
    ["mainnet", "mainnetsidechain", "polygon"].map((chainName) => {
      return Promise.all([
        logCache(chainName + " ASSET", initializeAssetCache({ chainName })),
        logCache(chainName + " Identity", initAccountCache({ chainName })),
      ]);
    })
  );
}

async function processEventAsset({ event, chainName }) {
  let { tokenId, hash, key, value } = event.returnValues;

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
      } = await getAllWithdrawsDeposits("ASSET")(chainName);

      const token = await getChainAsset("ASSET")(chainName)(
        tokenId,
        storeEntries,
        mainnetDepositedEntries,
        mainnetWithdrewEntries,
        sidechainDepositedEntries,
        sidechainWithdrewEntries,
        polygonDepositedEntries,
        polygonWithdrewEntries
      );

      if (
        token.owner.address !== "0x0000000000000000000000000000000000000000"
      ) {
        const tokenIdNum = parseInt(tokenId, 10);

        await putRedisItem(
          tokenIdNum,
          token,
          redisPrefixes.mainnetSidechainAsset
        );
      }
    } catch (e) {
      console.error(e);
    }
  } else if (hash && key && value) {
    console.log("updating hash 1", { hash, key, value }, event.returnValues);

    const tokens = await getRedisAllItems(redisPrefixes[chainName + "Asset"]);
    const token = tokens.find((token) => token.hash === hash);
    console.log("updating hash 2", token);
    if (token) {
      let updated = false;
      if (assetKeys.includes(key)) {
        token[key] = value;
        updated = true;
      }
      if (assetPropertiesKeys.includes(key)) {
        token.properties[key] = value;
        updated = true;
      }
      if (updated) {
        await putRedisItem(token.id, token, redisPrefixes.mainnetSidechainAsset);
      }
    } else {
      console.warn("could not find hash to update", token);
    }
  }

  const { blockNumber } = event;
  await putRedisItem(
    ids.lastCachedBlockAsset,
    {
      id: ids.lastCachedBlockAsset,
      number: blockNumber,
    },
    redisPrefixes.mainnetSidechainAsset
  );
}

async function processEventsAsset({ events, currentBlockNumber, chainName }) {
  const seenTokenIds = {};
  const tokenIds = events
    .map((event) => {
      let { tokenId } = event.returnValues;
      if (typeof tokenId === "string") {
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
    })
    .filter((tokenId) => tokenId !== null);

  console.log("process events", chainName, tokenIds.length);

  const storeEntries = [];
  const {
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
  } = await getAllWithdrawsDeposits("ASSET")(chainName);
  for (const tokenId of tokenIds) {
    const token = await getChainAsset("ASSET")(chainName)(
      tokenId,
      storeEntries,
      mainnetDepositedEntries,
      mainnetWithdrewEntries,
      sidechainDepositedEntries,
      sidechainWithdrewEntries,
      polygonDepositedEntries,
      polygonWithdrewEntries
    );

    if (token.owner.address !== "0x0000000000000000000000000000000000000000") {
      await putRedisItem(tokenId, token, redisPrefixes.mainnetSidechainAsset);
    }
  }

  await putRedisItem(
    ids.lastCachedBlockAsset,
    {
      id: ids.lastCachedBlockAsset,
      number: currentBlockNumber,
    },
    redisPrefixes.mainnetSidechainAsset
  );
}

async function processEventAccount({ event, chainName }) {
  let { owner } = event.returnValues;

  if (owner) {
    owner = owner.toLowerCase();
    try {
      const account = await getChainIdentity({
        address: owner,
        chainName,
      });
      await putRedisItem(owner, account, redisPrefixes.mainnetSidechainIdentity);
    } catch (e) {
      console.error(e);
    }
  }

  const { blockNumber } = event;
  await putRedisItem(
    ids.lastCachedBlockAccount,
    { number: blockNumber },
    redisPrefixes.mainnetSidechainIdentity
  );
}

const makeUnique = (a, pred = (a, b) => a === b) => {
  return a.filter((e, i) => {
    for (let j = 0; j < i; j++) {
      if (pred(a[j], e)) {
        return false;
      }
    }
    return true;
  });
};

async function processEventsAccount({ events, currentBlockNumber, chainName }) {
  let owners = events.map((e) => {
    let { owner } = e.returnValues;
    owner = owner.toLowerCase();
    return owner;
  });
  owners = makeUnique(owners);

  for (const owner of owners) {
    const account = await getChainIdentity({
      address: owner,
      chainName,
    });
    await putRedisItem(owner, account, redisPrefixes.mainnetSidechainIdentity);
  }

  await putRedisItem(
    ids.lastCachedBlockAccount,
    { number: currentBlockNumber },
    redisPrefixes.mainnetSidechainIdentity
  );
}
