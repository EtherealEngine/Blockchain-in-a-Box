const path = require("path");
const http = require("http");
const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const {
  getBlockchain,
} = require("@blockchain-in-a-box/common/src/blockchain.js");
const {
  makePromise,
  setCorsHeaders,
} = require("@blockchain-in-a-box/common/src/utils.js");
const {
  getRedisItem,
  parseRedisItems,
  getRedisClient,
} = require("@blockchain-in-a-box/common/src/redis.js");
const {
  redisPrefixes,
  mainnetSignatureMessage,
  assetIndexName,
  burnAddress,
  zeroAddress,
} = require("@blockchain-in-a-box/common/src/constants.js");
const { ResponseStatus } = require("../enums.js");
const {
  runSidechainTransaction,
} = require("@blockchain-in-a-box/common/src/assets.js");
const {
  PRODUCTION,
  DEVELOPMENT,
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
  MINTING_FEE,
  DEFAULT_ASSET_DESCRIPTION,
  IPFS_HOST,
  MAINNET_MNEMONIC,
} = require("@blockchain-in-a-box/common/src/environment.js");

const pinataSDK = require("@pinata/sdk");
const pinata =
  PINATA_API_KEY && PINATA_API_KEY !== ""
    ? pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY)
    : null;

const pinataOptions = {
  pinataOptions: {
    customPinPolicy: {
      regions: [
        {
          id: "FRA1",
          desiredReplicationCount: 1,
        },
        {
          id: "NYC1",
          desiredReplicationCount: 2,
        },
      ],
    },
  },
};

const redisClient = getRedisClient();

const network = PRODUCTION ? "mainnet" : "testnet";

const { Readable } = require("stream");

let contracts;

(async function () {
  const blockchain = await getBlockchain();
  contracts = blockchain.contracts;
})();

// Takes an account as input
async function listAssets(req, res, web3) {
  const { address, mainnetAddress } = req.params;

  if (DEVELOPMENT) setCorsHeaders(res);
  try {
    const [mainnetAssets, sidechainAssets] = await Promise.all([
      (async () => {
        if (!mainnetAddress) return [];
        const recoveredAddress = await web3[network].eth.accounts.recover(
          mainnetSignatureMessage,
          mainnetAddress
        );
        if (!recoveredAddress) return [];
        const p = makePromise();
        const args = `${assetIndexName} ${JSON.stringify(
          recoveredAddress
        )} INFIELDS 1 currentOwnerAddress LIMIT 0 1000000`
          .split(" ")
          .concat([
            (err, result) => {
              if (!err) {
                const items = parseRedisItems(result);
                p.accept({
                  Items: items,
                });
              } else {
                p.reject(err);
              }
            },
          ]);
        redisClient.ft_search.apply(redisClient, args);
        const o = await p;

        return (o && o.Items) || [];
      })(),
      (async () => {
        const p = makePromise();
        const args = `${assetIndexName} ${JSON.stringify(
          address
        )} INFIELDS 1 currentOwnerAddress LIMIT 0 1000000`
          .split(" ")
          .concat([
            (err, result) => {
              if (!err) {
                const items = parseRedisItems(result);
                p.accept({
                  Items: items,
                });
              } else {
                p.reject(err);
              }
            },
          ]);
        redisClient.ft_search.apply(redisClient, args);
        const o = await p;
        return (o && o.Items) || [];
      })(),
    ]);
    const assets = sidechainAssets
      .concat(mainnetAssets)
      .sort((a, b) => a.id - b.id)
      .filter((asset, i) => {
        // filter unique hashes
        if (
          asset === "0" ||
          (asset.properties.hash === "" && asset.owner.address === zeroAddress)
        )
          return false;

        for (let j = 0; j < i; j++) {
          if (
            assets[j].properties.hash === asset.properties.hash &&
            asset.properties.hash !== ""
          )
            return false;
        }
        return true;
      });
    return res.json({
      status: ResponseStatus.Success,
      assets: JSON.stringify(assets),
      error: null,
    });
  } catch (error) {
    return res.json({ status: ResponseStatus.Error, assets: null, error });
  }
}

// Called by create asset on successful resource upload
async function mintAssets(
  resHash,
  mnemonic,
  quantity,
  web3,
  contracts,
  res
) {
  let assetIds, status;
  const fullAmount = {
    t: "uint256",
    v: new web3.utils.BN(1e9)
      .mul(new web3.utils.BN(1e9))
      .mul(new web3.utils.BN(1e9)),
  };

  const fullAmountD2 = {
    t: "uint256",
    v: fullAmount.v.div(new web3.utils.BN(2)),
  };
  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();

  if (MINTING_FEE > 0) {
    let allowance = await contracts["Currency"].methods
      .allowance(address, contracts["Inventory"]._address)
      .call();
    allowance = new web3.utils.BN(allowance, 0);
    if (allowance.lt(fullAmountD2.v)) {
      const result = await runSidechainTransaction(mnemonic)(
        "Currency",
        "approve",
        contracts["Inventory"]._address,
        fullAmount.v
      );
      status = result.status;
    } else {
      status = true;
    }
  } else status = true;

  if (status) {
    const description = DEFAULT_ASSET_DESCRIPTION;

    let fileName = resHash.split("/").pop();

    let extName = path.extname(fileName).slice(1);
    extName = extName === "" ? "png" : extName;
    extName = extName === "jpeg" ? "jpg" : extName;

    fileName = extName ? fileName.slice(0, -(extName.length + 1)) : fileName;

    const { hash } = JSON.parse(Buffer.from(resHash, "utf8").toString("utf8"));

    const result = await runSidechainTransaction(mnemonic)(
      "Inventory",
      "mint",
      address,
      hash,
      fileName,
      extName,
      description,
      quantity
    );
    status = result.status;

    const assetId = new web3.utils.BN(
      result.logs[0].topics[3].slice(2),
      16
    ).toNumber();
    assetIds = [assetId, assetId + quantity - 1];
  }
  return res.json({ status: ResponseStatus.Success, assetIds, error: null });
}

async function createAsset(req, res, { web3, contracts }) {
  const { mnemonic, quantity, resourceHash } = req.body;

  try {
    const file = req.files && req.files[0];

    if (!bip39.validateMnemonic(mnemonic)) {
      return res.json({
        status: ResponseStatus.Error,
        error: "Invalid mnemonic",
      });
    }

    if (!resourceHash && !file) {
      return res.json({
        status: ResponseStatus.Error,
        error: "POST did not include a file or resourceHash",
      });
    }

    // Check if there are any files -- if there aren't, check if there's a hash
    if (resourceHash && file) {
      return res.json({
        status: ResponseStatus.Error,
        error: "POST should include a resourceHash *or* file but not both",
      });
    }

    if (file) {
      const readableStream = new Readable({
        read() {
          this.push(Buffer.from(file));
          this.push(null);
        },
      });
        const { IpfsHash } = pinata.pinFileToIPFS(
          readableStream,
          pinataOptions
        );
        if (IpfsHash)
          mintAssets(IpfsHash, mnemonic, quantity, web3, contracts, res);
        else
          res.json({
            status: ResponseStatus.Error,
            error: "Error pinning to Pinata service, hash was not returned",
          });
    } else {
      mintAssets(
        resourceHash,
        mnemonic,
        quantity,
        web3,
        contracts,
        res
      );
    }
  } catch (error) {
    console.warn(error.stack);
    return res.json({ status: ResponseStatus.Error, assetIds: [], error });
  }
}

async function readAsset(req, res) {
  const { assetId } = req.params;
  let o = await getRedisItem(assetId, redisPrefixes.mainnetSidechainAsset);
  let asset = o.Item;

  if (DEVELOPMENT) setCorsHeaders(res);
  if (asset) {
    return res.json({ status: ResponseStatus.Success, asset, error: null });
  } else {
    return res.json({
      status: ResponseStatus.Error,
      asset: null,
      error: "The asset could not be found",
    });
  }
}

async function readAssetRange(req, res) {
  if (DEVELOPMENT) setCorsHeaders(res);
  try {
    const { assetStartId, assetEndId } = req.params;

    if (
      assetStartId <= 0 ||
      assetEndId < assetStartId ||
      assetEndId - assetStartId > 100
    )
      return res.json({
        status: ResponseStatus.Error,
        error: "Invalid range for assets",
      });

    const promise = makePromise();
    const args =
      `${assetIndexName} * filter id ${assetStartId} ${assetEndId} LIMIT 0 1000000`
        .split(" ")
        .concat([
          (err, result) => {
            if (!err) {
              const items = parseRedisItems(result);
              promise.accept({
                Items: items,
              });
            } else {
              promise.reject(err);
            }
          },
        ]);
    redisClient.ft_search.apply(redisClient, args);
    const o = await promise;

    let assets = o.Items.filter((asset) => asset !== null)
      .sort((a, b) => a.id - b.id)
      .filter((asset, i) => {
        // filter unique hashes

        if (asset.properties.hash === "" && asset.owner.address === zeroAddress)
          return false;

        for (let j = 0; j < i; j++)
          if (
            assets[j].properties.hash === asset.properties.hash &&
            asset.properties.hash !== ""
          )
            return false;

        return true;
      });

    return res.json({ status: ResponseStatus.Success, assets, error: null });
  } catch (error) {
    return res.json({ status: ResponseStatus.Error, assets: [], error });
  }
}

// TODO: Try to unpin from pinata if we are using pinata
async function deleteAsset(req, res) {
  try {
    const { assetId } = req.body;

    let o = await getRedisItem(assetId, redisPrefixes.mainnetSidechainAsset);
    let asset = o.Item;

    const address = asset.owner.address;

    const currentHash = await contracts["mainnetsidechain"].Inventory.methods
      .getHash(assetId)
      .call();
    const randomHash = Math.random().toString(36);
    await runSidechainTransaction(MAINNET_MNEMONIC)(
      "Inventory",
      "updateHash",
      currentHash,
      randomHash
    );
    const result = await runSidechainTransaction(MAINNET_MNEMONIC)(
      "Inventory",
      "transferFrom",
      address,
      burnAddress,
      assetId
    );

    if (result) console.log("Result of delete transaction:", result);
    return res.json({ status: ResponseStatus.Success, error: null });
  } catch (error) {
    return res.json({ status: ResponseStatus.Error, error });
  }
}

async function sendAsset(req, res) {
  try {
    const { fromUserAddress, toUserAddress, assetId } = req.body;
    const quantity = req.body.quantity ?? 1;

    let status = true;
    let error = null;
    for (let i = 0; i < quantity; i++) {
      try {
        const isApproved = await contracts.Inventory.methods
          .isApprovedForAll(fromUserAddress, contracts["Trade"]._address)
          .call();
        if (!isApproved) {
          await runSidechainTransaction(MAINNET_MNEMONIC)(
            "Inventory",
            "setApprovalForAll",
            contracts["Trade"]._address,
            true
          );
        }

        const result = await runSidechainTransaction(MAINNET_MNEMONIC)(
          "Inventory",
          "transferFrom",
          fromUserAddress,
          toUserAddress,
          assetId
        );
        status = status && result.status;
      } catch (err) {
        console.warn(err.stack);
        status = false;
        error = err;
        break;
      }
    }

    if (status) {
      return res.json({
        status: ResponseStatus.Success,
        message: "Transferred " + assetId + " to " + toUserAddress,
        error: null,
      });
    } else {
      return res.json({
        status: ResponseStatus.Error,
        message: "Transfer request could not be fulfilled: " + status,
        error: error,
      });
    }
  } catch (error) {
    return res.json({
      status: ResponseStatus.Error,
      message: "Error sending asset",
      error: error,
    });
  }
}

async function signTransfer(req, res, blockchain) {
  console.warn("Method not implemented", req, res, blockchain);
}


// TODO: Try to unpin from pinata if we are using pinata and already have file
async function updatePublicAsset(req, res, { contracts }) {
  const { mnemonic, assetId, resourceHash } = req.body;
  const file = req.files && req.files[0];
  try {
    if (!bip39.validateMnemonic(mnemonic)) {
      return res.json({
        status: ResponseStatus.Error,
        error: "Invalid mnemonic",
      });
    }

    if (!resourceHash && !file) {
      return res.json({
        status: ResponseStatus.Error,
        error: "POST did not include a file or resourceHash",
      });
    }

    // Check if there are any files -- if there aren't, check if there's a hash
    if (resourceHash && file) {
      return res.json({
        status: ResponseStatus.Error,
        error: "POST should include a resourceHash *or* file but not both",
      });
    }

    if (file) {
      const readableStream = new Readable({
        read() {
          this.push(Buffer.from(file));
          this.push(null);
        },
      });

      // Pinata API keys are valid, so this is probably what the user wants
      if (pinata) {
        // TODO: Try to unpin existing pinata hash
        const { IpfsHash } = pinata.pinFileToIPFS(
          readableStream,
          pinataOptions
        );
        if (IpfsHash) {
          const currentHash = await contracts["mainnetsidechain"].Inventory.methods
            .getHash(assetId)
            .call();
          await runSidechainTransaction(MAINNET_MNEMONIC)(
            "Inventory",
            "updateHash",
            currentHash,
            IpfsHash
          );
        } else
          res.json({
            status: ResponseStatus.Error,
            error: "Error pinning to Pinata service, hash was not returned",
          });
      } else {
        // Upload to our own IPFS node
        const req = http.request(IPFS_HOST, { method: "POST" }, (res) => {
          const bufferString = [];
          res.on("data", (data) => {
            bufferString.push(data);
          });
          res.on("end", async () => {
            const buffer = Buffer.concat(bufferString);
            const string = buffer.toString("utf8");
            const { hash } = JSON.parse(string);
            if (hash) {
              const currentHash = await contracts[
                "mainnetsidechain"
              ].Inventory.methods
                .getHash(assetId)
                .call();
              await runSidechainTransaction(MAINNET_MNEMONIC)(
                "Inventory",
                "updateHash",
                currentHash,
                hash
              );
            } else
              return res.json({
                status: ResponseStatus.Error,
                error: "Error getting hash back from IPFS node",
              });
          });
          res.on("error", (err) => {
            console.warn(err.stack);
            return res.json({ status: ResponseStatus.Error, error: err.stack });
          });
        });
        req.on("error", (err) => {
          console.warn(err.stack);
          res.json({ status: ResponseStatus.Error, error: err.stack });
        });
        file.pipe(req);
      }
    } else {
      const currentHash = await contracts["mainnetsidechain"].Inventory.methods
        .getHash(assetId)
        .call();
      await runSidechainTransaction(MAINNET_MNEMONIC)(
        "Inventory",
        "updateHash",
        currentHash,
        resourceHash
      );
    }
  } catch (error) {
    console.warn(error.stack);
    return res.json({ status: ResponseStatus.Error, assetIds: [], error });
  }
}

module.exports = {
  listAssets,
  createAsset,
  updatePublicAsset,
  readAsset,
  readAssetRange,
  deleteAsset,
  sendAsset,
  signTransfer
};
