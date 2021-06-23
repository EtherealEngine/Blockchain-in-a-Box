const {
  getChainAsset,
  getChainIdentity,
  getAllWithdrawsDeposits,
} = require("./common/assets.js");
const {
  assetKeys,
  assetPropertiesKeys,
  ids,
  redisPrefixes,
} = require("./common/constants.js");
const {
  getBlockchain,
  getPastEvents,
  makeWeb3WebsocketContract,
} = require("./common/blockchain.js");
const {
  connect,
  getRedisAllItems,
  getRedisItem,
  putRedisItem,
} = require("./common/redis.js");

initCaches();

async function initializeAssetCache({ chainName }) {
  const { web3 } = await getBlockchain();

  await connect(process.env.REDIS_PORT, process.env.REDIS_HOST);

  const currentBlockNumber = await web3[chainName].eth.getBlockNumber();

  // Watch for new events.
  const recursivelyProcessEvents = (currentBlockNumber) => {
    const wsContract = makeWeb3WebsocketContract(chainName, "Inventory");
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
      contractName: "Inventory",
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
        logCache(chainName + " Inventory", initializeAssetCache({ chainName })),
        logCache(chainName + " Identity", initAccountCache({ chainName })),
      ]);
    })
  );
}

async function processEventAsset({ event, chainName }) {
  let { assetId, hash, key, value } = event.returnValues;

  if (assetId) {
    try {
      const storeEntries = [];
      const {
        mainnetDepositedEntries,
        mainnetWithdrewEntries,
        sidechainDepositedEntries,
        sidechainWithdrewEntries,
        polygonDepositedEntries,
        polygonWithdrewEntries,
      } = await getAllWithdrawsDeposits("Inventory")(chainName);

      const asset = await getChainAsset("Inventory")(chainName)(
        assetId,
        storeEntries,
        mainnetDepositedEntries,
        mainnetWithdrewEntries,
        sidechainDepositedEntries,
        sidechainWithdrewEntries,
        polygonDepositedEntries,
        polygonWithdrewEntries
      );

      if (
        asset.owner.address !== "0x0000000000000000000000000000000000000000"
      ) {
        const assetIdNum = parseInt(assetId, 10);

        await putRedisItem(
          assetIdNum,
          asset,
          redisPrefixes.mainnetSidechainAsset
        );
      }
    } catch (e) {
      console.error(e);
    }
  } else if (hash && key && value) {
    console.log("updating hash 1", { hash, key, value }, event.returnValues);

    const assets = await getRedisAllItems(redisPrefixes[chainName + "Asset"]);
    const asset = assets.find((asset) => asset.hash === hash);
    console.log("updating hash 2", asset);
    if (asset) {
      let updated = false;
      if (assetKeys.includes(key)) {
        asset[key] = value;
        updated = true;
      }
      if (assetPropertiesKeys.includes(key)) {
        asset.properties[key] = value;
        updated = true;
      }
      if (updated) {
        await putRedisItem(asset.id, asset, redisPrefixes.mainnetSidechainAsset);
      }
    } else {
      console.warn("could not find hash to update", asset);
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
  const seenAssetIds = {};
  const assetIds = events
    .map((event) => {
      let { assetId } = event.returnValues;
      if (typeof assetId === "string") {
        assetId = parseInt(assetId, 10);
        if (!seenAssetIds[assetId]) {
          seenAssetIds[assetId] = true;
          return assetId;
        } else {
          return null;
        }
      } else {
        return null;
      }
    })
    .filter((assetId) => assetId !== null);

  console.log("process events", chainName, assetIds.length);

  const storeEntries = [];
  const {
    mainnetDepositedEntries,
    mainnetWithdrewEntries,
    sidechainDepositedEntries,
    sidechainWithdrewEntries,
    polygonDepositedEntries,
    polygonWithdrewEntries,
  } = await getAllWithdrawsDeposits("Inventory")(chainName);
  for (const assetId of assetIds) {
    const asset = await getChainAsset("Inventory")(chainName)(
      assetId,
      storeEntries,
      mainnetDepositedEntries,
      mainnetWithdrewEntries,
      sidechainDepositedEntries,
      sidechainWithdrewEntries,
      polygonDepositedEntries,
      polygonWithdrewEntries
    );

    if (asset.owner.address !== "0x0000000000000000000000000000000000000000") {
      await putRedisItem(assetId, asset, redisPrefixes.mainnetSidechainAsset);
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
