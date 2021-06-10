const { Autohook } = require("twitter-autohook");
const http = require("http");
const https = require("https");
const path = require("path");
const url = require("url");
const mime = require("mime");
const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");

const {
  usersTableName,
  storageHost,
  previewHost,
  previewExt,
} = require("./constants");

let ddb,
  web3,
  contracts,
  getStores,
  runSidechainTransaction = null;

const {
  treasuryMnemonic,
  twitterConsumerKey,
  twitterConsumerSecret,
  twitterAccessToken,
  twitterAccessTokenSecret,
  twitterId,
  twitterWebhookPort,
  ngrokToken,
  serverPort,
} = require("fs").existsSync("./config.json")
  ? require("./config.json")
  : {
      treasuryMnemonic: process.env.treasuryMnemonic,
      twitterConsumerSecret: process.env.twitterConsumerSecret,
      twitterConsumerSecret: process.env.twitterConsumerSecret,
      twitterAccessToken: process.env.twitterAccessToken,
      twitterAccessTokenSecret: process.env.twitterAccessTokenSecret,
      twitterId: process.env.twitterId,
      twitterWebhookPort: process.env.twitterWebhookPort,
      ngrokToken: process.env.ngrokToken,
      serverPort: process.env.serverPort,
    };

const twitterConfigInvalid =
  twitterConsumerKey === undefined ||
  twitterConsumerSecret === undefined ||
  twitterAccessToken === undefined ||
  twitterAccessTokenSecret === undefined ||
  twitterId === undefined ||
  twitterWebhookPort === undefined ||
  twitterConsumerKey === null ||
  twitterConsumerSecret === null ||
  twitterAccessToken === null ||
  twitterAccessTokenSecret === null ||
  twitterId === null ||
  twitterWebhookPort === null;

let TwitClient;

const _items =
  (id, twitterUserId, addressToGetFrom, page, contractName, messageType) =>
  async (getEntries, print) => {
    if (!isNaN(page)) page = 1;
    else page = parseInt(page, 10);

    let address, userLabel;
    const _loadFromUserId = async (userId) => {
      const spec = await _getUser(userId);
      let mnemonic = spec.mnemonic;
      if (!mnemonic) {
        const spec = await _genKey(userId);
        mnemonic = spec.mnemonic;
      }

      const wallet = hdkey
        .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
        .derivePath(`m/44'/60'/0'/0/0`)
        .getWallet();
      address = wallet.getAddressString();

      userLabel = userId;
    };
    const _loadFromAddress = (a) => {
      address = a;
      userLabel = a;
    };
    const _loadFromTreasury = () => {
      const wallet = hdkey
        .fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic))
        .derivePath(`m/44'/60'/0'/0/0`)
        .getWallet();
      address = wallet.getAddressString();
      userLabel = "treasury";
    };
    // If it's a username
    if (
      addressToGetFrom !== undefined &&
      (match = addressToGetFrom.match(/@([a-zA-Z0-9_])*/))
    ) {
      await _loadFromUserId(match[0]);
      // If it's an eth address
    } else if (
      addressToGetFrom !== undefined &&
      (match = addressToGetFrom.match(/^(0x[0-9a-f]+)$/i))
    ) {
      _loadFromAddress(match[1]);
      // If it's the treasury
    } else if (addressToGetFrom.toLowerCase() === "treasury") {
      _loadFromTreasury();
    } else {
      await _loadFromUserId(twitterUserId);
    }

    const nftBalance = await contracts[contractName].methods
      .balanceOf(address)
      .call();
    const maxEntriesPerPage = 10;
    const numPages = Math.max(Math.ceil(nftBalance / maxEntriesPerPage), 1);
    page = Math.min(Math.max(page, 1), numPages);
    const startIndex = (page - 1) * maxEntriesPerPage;
    const endIndex = Math.min(page * maxEntriesPerPage, nftBalance);

    const entries = await getEntries(address, startIndex, endIndex);

    const s = print(userLabel, page, numPages, entries);
    SendMessage(id, twitterUserId, messageType, s);
  };

const _getUser = async (id) => {
  const tokenItem = await ddb
    .getItem({
      TableName: usersTableName,
      Key: {
        email: { S: id + ".twittertoken" },
      },
    })
    .promise();

  let mnemonic =
    tokenItem.Item && tokenItem.Item.mnemonic
      ? tokenItem.Item.mnemonic.S
      : null;
  return { mnemonic };
};

const _genKey = async (id) => {
  const mnemonic = bip39.generateMnemonic();
  await ddb
    .putItem({
      TableName: usersTableName,
      Item: {
        email: { S: id + ".twittertoken" },
        mnemonic: { S: mnemonic },
      },
    })
    .promise();
  return { mnemonic };
};

const SendMessage = (id, twitterUserId, messageType, text) => {
  console.log("on SendMessage");
  console.log({ id, messageType, text });
  if (messageType === "DM") {
    TwitClient.post(
      "direct_messages/events/new",
      {
        event: {
          type: "message_create",
          message_create: {
            target: {
              recipient_id: id,
            },
            message_data: {
              text: text,
            },
          },
        },
      },
      (error, data, response) => {
        if (error) console.log(error);
      }
    );
  } else {
    TwitClient.post(
      "statuses/update",
      {
        status: "@" + twitterUserId + " " + text,
        id,
        in_reply_to_status_id: id,
      },
      function (err, data, response) {
        console.log("Posted ", "@" + twitterUserId + " " + text);
      }
    );
  }
};

const play = async (id, twitterUserId, messageType) => {
  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }
  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();

  const currentName = await contracts.Account.methods
    .getMetadata(address, "name")
    .call();

  if (currentName) {
    const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1)
      .toString(10)
      .slice(-6);
    await ddb
      .putItem({
        TableName: usersTableName,
        Item: {
          email: { S: twitterUserId + ".twittercode" },
          code: { S: code },
        },
      })
      .promise();
    if (messageType === "DM")
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Play: https://webaverse.com/login?id=${id}&code=${code}&play=true&twitter=true`
      );
    else SendMessage(id, twitterUserId, messageType, `DM me for a play link`);
  } else {
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "name",
      twitterUserId
    );

    const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1)
      .toString(10)
      .slice(-6);
    await ddb
      .putItem({
        TableName: usersTableName,
        Item: {
          email: { S: twitterUserId + ".twittercode" },
          code: { S: code },
        },
      })
      .promise();

    if (messageType === "DM")
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Play: https://webaverse.com/login?id=${id}&code=${code}&play=true&twitter=true`
      );
    else SendMessage(id, twitterUserId, messageType, `DM me for a play link`);
  }
};

const help = (id, twitterUserId, messageType) => {
  SendMessage(
    id,
    twitterUserId,
    messageType,
    "For a list of commands, please visit https://docs.webaverse.com/docs/webaverse/discord-bot"
  );
};

const status = async (id, twitterUserId, messageType) => {
  if (ddb == null) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Unable to get status for ${twitterUserId} - database not configured`
    );
    return;
  }
  let mnemonic;
  (async () => {
    const spec = await _getUser(twitterUserId);
    mnemonic = spec.mnemonic;
    if (!mnemonic) {
      const spec = await _genKey(twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const [name, avatarId, homeSpaceId, monetizationPointer] =
      await Promise.all([
        contracts.Account.methods.getMetadata(address, "name").call(),
        contracts.Account.methods.getMetadata(address, "avatarId").call(),
        contracts.Account.methods.getMetadata(address, "homeSpaceId").call(),
        contracts.Account.methods
          .getMetadata(address, "monetizationPointer")
          .call(),
      ]);

    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Name: ${name}\nAvatar: ${avatarId}\nHome Space: ${homeSpaceId}\nMonetization Pointer: ${monetizationPointer}`
    );
  })();
};

const inventory = async (
  id,
  twitterUserId,
  addressToGetFrom,
  page = 1,
  messageType
) => {
  addressToGetFrom = addressToGetFrom || twitterUserId;
  if (ddb == null) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Unable to get inventory for ${addressToGetFrom} at page ${page} - database not configured.`
    );
    return;
  }

  if (messageType !== "DM") {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `DM me for inventory information.`
    );
    return;
  }

  (async () => {
    await _items(
      id,
      twitterUserId,
      addressToGetFrom,
      page,
      "NFT",
      messageType
    )(
      async (address, startIndex, endIndex) => {
        const hashToIds = {};
        const promises = [];
        for (let i = startIndex; i < endIndex; i++) {
          promises.push(
            (async (i) => {
              const id = await contracts.NFT.methods
                .tokenOfOwnerByIndex(address, i)
                .call();
              const hash = await contracts.NFT.methods.getHash(id).call();
              if (!hashToIds[hash]) {
                hashToIds[hash] = [];
              }
              hashToIds[hash].push(id);
            })(i)
          );
        }
        await Promise.all(promises);

        const entries = [];
        await Promise.all(
          Object.keys(hashToIds).map(async (hash) => {
            const ids = hashToIds[hash].sort();
            const id = ids[0];
            const [name, ext, totalSupply] = await Promise.all([
              contracts.NFT.methods.getMetadata(hash, "name").call(),
              contracts.NFT.methods.getMetadata(hash, "ext").call(),
              contracts.NFT.methods.totalSupplyOfHash(hash).call(),
            ]);
            const balance = ids.length;
            entries.push({
              id,
              ids,
              hash,
              name,
              ext,
              balance,
              totalSupply,
            });
          })
        );
        return entries;
      },
      (userLabel, page, numPages, entries) => {
        let s = userLabel + "'s inventory:\n";
        if (entries.length > 0) {
          s += `Page ${page}/${numPages}` + "\n";
          s +=
            "" +
            entries
              .map(
                (entry, i) =>
                  `${entry.id}. ${entry.name} ${entry.ext} ${entry.hash} (${
                    entry.balance
                  }/${entry.totalSupply}) [${entry.ids.join(",")}]`
              )
              .join("\n") +
            "";
        } else {
          s += "inventory is empty!";
        }
        return s;
      }
    ).catch(console.warn);
  })();
};

const address = async (id, twitterUserId, addressToGet, messageType) => {
  if (ddb == null) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Unable to get address for ${twitterUserId} - database not configured`
    );
    return;
  }
  let user, address;
  if (addressToGet !== "treasury") {
    if (addressToGet && (match = addressToGet.match(/@([a-zA-Z0-9_])*/))) {
      user = match[0];
    } else {
      user = twitterUserId;
    }
    let mnemonic;
    const spec = await _getUser(user);
    if (spec.mnemonic) {
      mnemonic = spec.mnemonic;
    } else {
      const spec = await _genKey(user);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    address = wallet.getAddressString();

    userLabel = user;
  } else {
    address = treasuryAddress;
    user = "treasury";
  }
  let message = address ? user + "'s address: " + address : "No such user";

  SendMessage(id, twitterUserId, messageType, message);
};

const setName = async (id, twitterUserId, name, messageType) => {
  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  if (name) {
    if (/['"]{2}/.test(name)) {
      name = "";
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "name",
      name
    );
    SendMessage(id, twitterUserId, messageType, "Set name to " + name);
  } else {
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const name = await contracts.Account.methods
      .getMetadata(address, "name")
      .call();
    SendMessage(id, twitterUserId, messageType, "Name is " + name);
  }
};

const send = async (
  id,
  twitterUserId,
  addressToSendTo,
  amount,
  messageType
) => {
  amount = parseFloat(amount);

  console.log("Address to send to");
  if ((match = addressToSendTo.match(/@([a-zA-Z0-9_])*/))) {
    console.log(match);
  }
  // Send to user name
  if (addressToSendTo.match(/@([a-zA-Z0-9_])*/)) {
    const userId = match[0];
    let mnemonic, mnemonic2;
    if (userId !== twitterUserId) {
      {
        const userSpec = await _getUser(twitterUserId);
        mnemonic = userSpec.mnemonic;
        if (!mnemonic) {
          const spec = await _genKey(twitterUserId);
          mnemonic = spec.mnemonic;
        }
      }
      {
        const userSpec = await _getUser(userId);
        mnemonic2 = userSpec.mnemonic;
        if (!mnemonic2) {
          const spec = await _genKey(userId);
          mnemonic2 = spec.mnemonic;
        }
      }
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Can't send SILK to yourself!`
      );
      return;
    }

    const wallet2 = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address2 = wallet2.getAddressString();

    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)(
        "FT",
        "transfer",
        address2,
        amount
      );
      status = result.status;
      transactionHash = result.transactionHash;
    } catch (err) {
      console.warn(err.stack);
      status = false;
      transactionHash = "0x0";
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Sent ${amount} SILK to ${userId}`
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Couldn't send ${amount} SILK to ${userId}: ${transactionHash}`
      );
    }
  }
  // Send to address
  else if ((match = addressToSendTo.match(/(0x[0-9a-f]+)/i))) {
    let { mnemonic } = await _getUser(twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey(twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const address2 = match[1];

    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)(
        "FT",
        "transfer",
        address2,
        amount
      );
      status = result.status;
      transactionHash = result.transactionHash;
    } catch (err) {
      console.warn(err.stack);
      status = false;
      transactionHash = "0x0";
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "sent " + amount + " SILK to " + address2
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "could not send: " + transactionHash
      );
    }
  }
  // Send to treasury
  else if (addressToSendTo === "treasury") {
    let { mnemonic } = await _getUser(twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey();
      mnemonic = spec.mnemonic;
    }

    const wallet2 = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address2 = wallet2.getAddressString();

    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)(
        "FT",
        "transfer",
        address2,
        amount
      );
      status = result.status;
      transactionHash = result.transactionHash;
    } catch (err) {
      console.warn(err.stack);
      status = false;
      transactionHash = "0x0";
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "sent " + amount + " SILK to treasury"
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "could not send: " + transactionHash
      );
    }
  } else {
    SendMessage(id, twitterUserId, messageType, "unknown user");
  }
};

const avatar = async (id, twitterUserId, nftId, messageType) => {
  nftId = parseInt(nftId, 10);

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();

  if (!isNaN(nftId)) {
    const hash = await contracts.NFT.methods.getHash(nftId).call();
    const [name, ext] = await Promise.all([
      contracts.NFT.methods.getMetadata(hash, "name").call(),
      contracts.NFT.methods.getMetadata(hash, "ext").call(),
    ]);

    const avatarPreview = `${previewHost}/${hash}${
      ext ? "." + ext : ""
    }/preview.${previewExt}`;

    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarId",
      nftId + ""
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarName",
      name
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarExt",
      ext
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarPreview",
      avatarPreview
    );

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Set avatar to " + JSON.stringify(nftId)
    );
  } else if (contentId) {
    const name = path.basename(contentId);
    const ext = path.extname(contentId).slice(1);
    const avatarPreview = `https://preview.exokit.org/[${contentId}]/preview.jpg`;

    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarId",
      contentId
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarName",
      name
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarExt",
      ext
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarPreview",
      avatarPreview
    );

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Set avatar to " + JSON.stringify(contentId)
    );
  } else {
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const avatarId = await contracts.Account.methods
      .getMetadata(address, "avatarId")
      .call();

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Current avatar is " + JSON.stringify(avatarId)
    );
  }
};

const homespace = async (id, twitterUserId, nftId, messageType) => {
  nftId = parseInt(nftId, 10);

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();

  if (!isNaN(nftId)) {
    const hash = await contracts.NFT.methods.getHash(nftId).call();
    const [name, ext] = await Promise.all([
      contracts.NFT.methods.getMetadata(hash, "name").call(),
      contracts.NFT.methods.getMetadata(hash, "ext").call(),
    ]);

    const homeSpacePreview = `${previewHost}/${hash}${
      ext ? "." + ext : ""
    }/preview.${previewExt}`;

    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpaceId",
      nftId + ""
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpaceName",
      name
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpaceExt",
      ext
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpacePreview",
      homeSpacePreview
    );

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Set homespace to " + JSON.stringify(nftId)
    );
  } else if (contentId) {
    const name = path.basename(contentId);
    const ext = path.extname(contentId).slice(1);
    const homeSpacePreview = `${previewHost}/${hash}${
      ext ? "." + ext : ""
    }/preview.${previewExt}`;

    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpaceId",
      contentId
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpaceName",
      name
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpaceExt",
      ext
    );
    await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "homeSpacePreview",
      homeSpacePreview
    );

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Set homespace to " + JSON.stringify(contentId)
    );
  } else {
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const avatarId = await contracts.Account.methods
      .getMetadata(address, "homeSpaceId")
      .call();

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Current homespace is " + JSON.stringify(avatarId)
    );
  }
};

const monetizationPointer = async (
  id,
  twitterUserId,
  pointerAddress,
  messageType
) => {
  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  if (pointerAddress) {
    const monetizationPointer = pointerAddress;
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const result = await runSidechainTransaction(mnemonic)(
      "Account",
      "setMetadata",
      address,
      "monetizationPointer",
      monetizationPointer
    );

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Set monetization pointer to " + JSON.stringify(monetizationPointer)
    );
  } else {
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const monetizationPointer = await contracts.Account.methods
      .getMetadata(address, "monetizationPointer")
      .call();

    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Monetization pointer is " + JSON.stringify(monetizationPointer)
    );
  }
};

const key = async (id, twitterUserId, commandArg1, messageType) => {
  const shouldReset = commandArg1.trim().toLowerCase() === "reset";

  // TODO: Handle reset, etc

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();
  const privateKey = wallet.privateKey.toString("hex");
  if (messageType === "DM")
    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Address: `" +
        address +
        "`\nMnemonic:" +
        mnemonic +
        "\nPrivate key: " +
        privateKey
    );
  else
    SendMessage(
      id,
      twitterUserId,
      messageType,
      "DM me to get your private key"
    );
};

const transfer = async (
  id,
  twitterUserId,
  addressToTransferTo,
  nftId,
  quantity,
  messageType
) => {
  quantity = quantity ? parseInt(quantity, 10) : 1;

  if (isNaN(nftId)) {
    SendMessage("Invalid token ID");
    return;
  }
  if (isNaN(quantity)) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Invalid quantity: " + quantity
    );
    return;
  }

  if ((match = addressToTransferTo.match(/@([a-zA-Z0-9_])*/))) {
    const userId = match[0];
    let mnemonic, mnemonic2;
    if (userId !== twitterUserId) {
      {
        const userSpec = await _getUser(twitterUserId);
        mnemonic = userSpec.mnemonic;
        if (!mnemonic) {
          const spec = await _genKey(twitterUserId);
          mnemonic = spec.mnemonic;
        }
      }
      {
        const userSpec = await _getUser(userId);
        mnemonic2 = userSpec.mnemonic;
        if (!mnemonic2) {
          const spec = await _genKey(userId);
          mnemonic2 = spec.mnemonic;
        }
      }
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Unable to fulfill transfer request.`
      );
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();

    const wallet2 = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address2 = wallet2.getAddressString();

    let status = true,
      transactionHash;
    try {
      const hash = await contracts.NFT.methods.getHash(nftId).call();

      const ids = [];
      const nftBalance = await contracts.NFT.methods.balanceOf(address).call();
      for (let i = 0; i < nftBalance; i++) {
        const id = await contracts.NFT.methods
          .tokenOfOwnerByIndex(address, i)
          .call();
        const hash2 = await contracts.NFT.methods.getHash(nftId).call();
        if (hash2 === hash) {
          ids.push(nftId);
        }
      }
      ids.sort();

      if (ids.length >= quantity) {
        const isApproved = await contracts.NFT.methods
          .isApprovedForAll(address, contracts["Trade"]._address)
          .call();
        if (!isApproved) {
          await runSidechainTransaction(mnemonic)(
            "NFT",
            "setApprovalForAll",
            contracts["Trade"]._address,
            true
          );
        }

        for (let i = 0; i < quantity; i++) {
          const id = ids[i];
          const result = await runSidechainTransaction(mnemonic)(
            "NFT",
            "transferFrom",
            address,
            address2,
            nftId
          );
          status = status && result.status;
          transactionHash = result.transactionHash;
        }
      } else {
        status = false;
        transactionHash = "insufficient nft balance";
      }
    } catch (err) {
      console.warn(err.stack);
      status = false;
      transactionHash = "0x0";
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Transferred " +
          id +
          (quantity > 1 ? `(x${quantity})` : "") +
          " to " +
          userId +
          ` https://webaverse.com/assets/${nftId}`
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `ERROR: Couldn't transfer ` +
          id +
          (quantity > 1 ? `(x${quantity})` : "") +
          " to " +
          userId
      );
    }
  } else if ((match = addressToTransferTo.match(/^(0x[0-9a-f]+)$/i))) {
    let { mnemonic } = await _getUser(twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey(twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();

    const address2 = match[1];

    let status = true;
    for (let i = 0; i < quantity; i++) {
      try {
        const isApproved = await contracts.NFT.methods
          .isApprovedForAll(address, contracts["Trade"]._address)
          .call();
        if (!isApproved) {
          await runSidechainTransaction(mnemonic)(
            "NFT",
            "setApprovalForAll",
            contracts["Trade"]._address,
            true
          );
        }

        const result = await runSidechainTransaction(mnemonic)(
          "NFT",
          "transferFrom",
          address,
          address2,
          id
        );
        status = status && result.status;
      } catch (err) {
        console.warn(err.stack);
        status = false;
        break;
      }
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Transferred " +
          id +
          " to " +
          address2 +
          ` https://webaverse.com/assets/${nftId}`
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Transfer request could not be fulfilled: " + status
      );
    }
  } else if (addressToTransferTo === "treasury") {
    let { mnemonic } = await _getUser(twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey(twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();

    const wallet2 = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address2 = wallet2.getAddressString();

    let status = true;
    for (let i = 0; i < quantity; i++) {
      try {
        const isApproved = await contracts.NFT.methods
          .isApprovedForAll(address, contracts["Trade"]._address)
          .call();
        if (!isApproved) {
          await runSidechainTransaction(mnemonic)(
            "NFT",
            "setApprovalForAll",
            contracts["Trade"]._address,
            true
          );
        }

        const result = await runSidechainTransaction(mnemonic)(
          "NFT",
          "transferFrom",
          address,
          address2,
          id
        );
        status = status && result.status;
      } catch (err) {
        console.warn(err.stack);
        status = false;
        break;
      }
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        twitterUserId +
          " transferred " +
          id +
          " to treasury" +
          ` https://webaverse.com/assets/${nftId}`
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        `Couldn't transfer ${id} to treasury`
      );
    }
  }
};

const preview = async (id, twitterUserId, nftId, messageType) => {
  SendMessage(
    id,
    twitterUserId,
    messageType,
    `${twitterUserId} View NFT #${nftId} on Webaverse: https://webaverse.com/assets/${nftId}`
  );
};

const gif = async (id, twitterUserId, nftId, messageType) => {
  SendMessage(
    id,
    twitterUserId,
    messageType,
    `GIF previews aren't available on Twitter. Try Discord or view on the site here: https://webaverse.com/assets/${nftId}`
  );
};

const wget = async (id, twitterUserId, nftId, messageType) => {
  if (isNaN(id)) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `${twitterUserId} Invalid token id:${nftId}`
    );
    return;
  }

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();
  let owner = await contracts.NFT.methods.ownerOf(nftId).call();
  owner = owner.toLowerCase();
  if (owner === address) {
    const hash = await contracts.NFT.methods.getHash(nftId).call();
    const [name, ext] = await Promise.all([
      contracts.NFT.methods.getMetadata(hash, "name").call(),
      contracts.NFT.methods.getMetadata(hash, "ext").call(),
    ]);

    // const buffer = await _readStorageHashAsBuffer(hash);

    // TODO: wget isn't really implemented, just sending IPFS URL

    SendMessage(
      id,
      twitterUserId,
      messageType,
      `${twitterUserId} ${id} is this: https://ipfs.exokit.org/${hash}/src.${ext}`
    );
  } else {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `${twitterUserId} Not your token: ${id}`
    );
  }
};

const get = async (id, twitterUserId, nftId, key, messageType) => {
  if (key === undefined) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `GET for NFT #${nftId}: Error: You must specify a key`
    );
    return;
  }
  nftId = parseInt(nftId, 10);
  const hash = await contracts.NFT.methods.getHash(nftId).call();
  const value = await contracts.NFT.methods.getMetadata(hash, key).call();
  SendMessage(
    id,
    twitterUserId,
    messageType,
    `Data for NFT #${nftId} -> ${key}: ${value}`
  );
};

const set = async (
  id,
  twitterUserId,
  nftId,
  metaDataKey,
  metaDataValue,
  messageType
) => {
  SendMessage(id, twitterUserId, messageType, "set");
  nftId = parseInt(nftId, 10);
  const key = metaDataKey;
  const value = metaDataValue;

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  const hash = await contracts.NFT.methods.getHash(nftId).call();

  let status, transactionHash;

  try {
    const result = await runSidechainTransaction(mnemonic)(
      "NFT",
      "setMetadata",
      hash,
      key,
      value
    );
    status = result.status;
    transactionHash = result.transactionHash;
  } catch (err) {
    console.warn(err.stack);
    status = false;
    transactionHash = "0x0";
  }

  if (status) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Set "${key}" for NFT #${nftId} to "${value}"`
    );
  } else {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Could not set ${key} for ${nftId}: ${transactionHash}`
    );
  }
};

function downloadMedia(url) {
  return new Promise((accept, reject) => {
    const oauth = OAuth({
      consumer: {
        key: twitterConsumerKey,
        secret: twitterConsumerSecret,
      },
      signature_method: "HMAC-SHA1",
      hash_function(base_string, key) {
        return crypto
          .createHmac("sha1", key)
          .update(base_string)
          .digest("base64");
      },
    });

    const request_data = {
      url: url,
      method: "GET",
      data: {},
    };

    // Note: The token is optional for some requests
    const token = {
      key: twitterAccessToken,
      secret: twitterAccessTokenSecret,
    };
    const req = https.request(
      request_data.url,
      {
        method: request_data.method,
        headers: oauth.toHeader(oauth.authorize(request_data, token)),
      },
      accept
    );
    req.on("error", reject);
    req.end();
  });
}

const mint = async (
  id,
  twitterUserId,
  url,
  quantity = 1,
  event,
  messageType
) => {
  quantity = parseInt(quantity, 10);
  let manualUrl;
  if (isNaN(quantity)) {
    quantity = 1;
  }

  manualUrl = url;

  console.log("Events");

  let owner_id = 0;
  let message;
  let msg_content;

  if (event.direct_message_events) {
    message = event.direct_message_events.shift();
    msg_content = message.message_create.message_data.text;
    media_tmp = message.message_create.message_data.attachment;
    owner_id = message.message_create.target.recipient_id;
    owner_name = event.users[owner_id].screen_name;
  } else {
    message = event.tweet_create_events.shift();
    msg_content = message.text;
    console.log("MESSAGE CONTENT IS", msg_content);
    owner_name = twitterUserId;

    // Split message text,

    console.log("URL IS", url);
    console.log("MESSAGE IS");
    console.log(message);
    media_tmp = message.entities.media[0];
    console.log(media_tmp);
  }

  if (typeof media_tmp !== "undefined") {
    const newUrl = media_tmp.media_url_https || media_tmp.media.media_url_https;
    const res = await downloadMedia(newUrl);
    await finishMinting(
      id,
      twitterUserId,
      newUrl,
      quantity,
      event,
      messageType,
      res
    );
  } else {
    await finishMinting(
      id,
      twitterUserId,
      manualUrl,
      quantity,
      event,
      messageType
    );
  }
};

const finishMinting = async (
  id,
  twitterUserId,
  manualUrl,
  quantity = 1,
  event,
  messageType,
  response
) => {
  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }
  const files = [];
  if (response) {
    files.push(response);
  }
  console.log("********* URL: ", manualUrl);
  if (!response) {
    const match = manualUrl.match(/^http(s)?:\/\//);
    if (match) {
      const proxyRes = await new Promise((accept, reject) => {
        const proxyReq = (match[1] ? https : http).request(
          manualUrl,
          (proxyRes) => {
            proxyRes.name = manualUrl.match(/\/([^\/]+?)(?:\?.*)?$/)[1];
            if (!/\/..+$/.test(proxyRes.name)) {
              const contentType = proxyRes.headers["content-type"];
              if (contentType) {
                const ext = mime.getExtension(contentType) || "bin";
                proxyRes.name += "." + ext;
              }
            }
            accept(proxyRes);
          }
        );
        proxyReq.once("error", reject);
        proxyReq.end();
      });
      files.push(proxyRes);
      console.log("Proxy res is ", proxyRes);
    }
  }

  if (files !== null) {
    await Promise.all(
      files.map(async (file) => {
        const req = https.request(
          storageHost,
          {
            method: "POST",
          },
          (res) => {
            const bs = [];
            res.on("data", (d) => {
              bs.push(d);
            });
            res.on("end", async () => {
              const b = Buffer.concat(bs);
              const s = b.toString("utf8");
              const j = JSON.parse(s);
              const { hash } = j;

              const wallet = hdkey
                .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
                .derivePath(`m/44'/60'/0'/0/0`)
                .getWallet();
              const address = wallet.getAddressString();

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

              let status, transactionHash, tokenIds;
              try {
                let allowance = await contracts.FT.methods
                  .allowance(address, contracts["NFT"]._address)
                  .call();
                allowance = new web3.utils.BN(allowance, 10);
                if (allowance.lt(fullAmountD2.v)) {
                  const result = await runSidechainTransaction(mnemonic)(
                    "FT",
                    "approve",
                    contracts["NFT"]._address,
                    fullAmount.v
                  );
                  status = result.status;
                } else {
                  status = true;
                }
                if (status) {
                  const description = "";

                  let fileName = file.name || manualUrl.split("/").pop();

                  console.log("File name is", fileName);

                  let extName = path.extname(fileName).slice(1);
                  extName = extName === "" ? "png" : extName;
                  extName = extName === "jpeg" ? "jpg" : extName;
                  console.log("ExtName is", extName);
                  fileName = extName
                    ? fileName.slice(0, -(extName.length + 1))
                    : fileName;
                  console.log("fileName name is", fileName);
                  console.log("minting", [
                    "NFT",
                    "mint",
                    address,
                    hash,
                    fileName,
                    extName,
                    description,
                    quantity,
                  ]);
                  console.log("Mnemonic is", mnemonic);
                  const result = await runSidechainTransaction(mnemonic)(
                    "NFT",
                    "mint",
                    address,
                    hash,
                    fileName,
                    extName,
                    description,
                    quantity
                  );
                  status = result.status;
                  transactionHash = result.transactionHash;

                  console.log("Result is");
                  console.log(result);
                  const tokenId = new web3.utils.BN(
                    result.logs[0].topics[3].slice(2),
                    16
                  ).toNumber();
                  tokenIds = [tokenId, tokenId + quantity - 1];
                }
              } catch (err) {
                console.warn(err.stack);
                status = false;
                transactionHash = err.message;
                tokenIds = [];
              }

              if (status) {
                SendMessage(
                  id,
                  twitterUserId,
                  messageType,
                  "Minted " +
                    (tokenIds[0] === tokenIds[1]
                      ? "https://webaverse.com/assets/" + tokenIds[0]
                      : tokenIds
                          .map((n) => "https://webaverse.com/assets/" + n)
                          .join(" - ")) +
                    " (" +
                    hash +
                    ")"
                );
              } else {
                SendMessage(
                  id,
                  twitterUserId,
                  messageType,
                  "Mint transaction failed: " + transactionHash
                );
              }
            });
            res.on("error", (err) => {
              console.warn(err.stack);
              SendMessage(
                id,
                twitterUserId,
                messageType,
                "Mint failed: " + err.message
              );
            });
            res.on("data", (err) => {
              console.log(err);
            });
          }
        );
        req.on("error", (err) => {
          console.warn(err.stack);
          SendMessage(
            id,
            twitterUserId,
            messageType,
            "Mint failed: " + err.message
          );
        });
        file.pipe(req);
      })
    );
  } else {
    SendMessage(id, twitterUserId, messageType, "No files to mint");
  }
};

const update = async (id, twitterUserId, nftId, url, event, messageType) => {
  let manualUrl;
  manualUrl = url;

  let owner_id = 0;
  let message;
  let msg_content;

  if (messageType === "DM") {
    message = event.direct_message_events.shift();
    msg_content = message.message_create.message_data.text;
    media_tmp = message.message_create.message_data.attachment;
    owner_id = message.message_create.target.recipient_id;
    owner_name = event.users[owner_id].screen_name;
  } else {
    message = event.tweet_create_events.shift();
    msg_content = message.text;
    owner_name = twitterUserId;
    media_tmp = message.entities.media[0];
  }

  if (typeof media_tmp !== "undefined") {
    const newUrl = media_tmp.media_url_https || media_tmp.media.media_url_https;
    const res = await downloadMedia(newUrl);
    await finishUpdating(
      id,
      twitterUserId,
      newUrl,
      nftId,
      event,
      messageType,
      res
    );
  } else {
    await finishUpdating(
      id,
      twitterUserId,
      manualUrl,
      nftId,
      event,
      messageType
    );
  }
};

const finishUpdating = async (
  id,
  twitterUserId,
  manualUrl,
  tokenId,
  event,
  messageType,
  response
) => {
  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }
  const files = [];
  if (response) files.push(response);
  if (!response) {
    const match = manualUrl.match(/^http(s)?:\/\//);
    if (match) {
      const proxyRes = await new Promise((accept, reject) => {
        const proxyReq = (match[1] ? https : http).request(
          manualUrl,
          (proxyRes) => {
            proxyRes.name = manualUrl.match(/\/([^\/]+?)(?:\?.*)?$/)[1];
            if (!/\/..+$/.test(proxyRes.name)) {
              const contentType = proxyRes.headers["content-type"];
              if (contentType) {
                const ext = mime.getExtension(contentType) || "bin";
                proxyRes.name += "." + ext;
              }
            }
            accept(proxyRes);
          }
        );
        proxyReq.once("error", reject);
        proxyReq.end();
      });
      files.push(proxyRes);
    }
  }

  if (files.length > 0) {
    const oldHash = await contracts.NFT.methods.getHash(tokenId).call();

    await Promise.all(
      files.map(async (file) => {
        const req = https.request(
          storageHost,
          {
            method: "POST",
          },
          (res) => {
            const bs = [];
            res.on("data", (d) => {
              console.log(d);
              bs.push(d);
            });
            res.on("end", async () => {
              const b = Buffer.concat(bs);
              const s = b.toString("utf8");
              const j = JSON.parse(s);
              const { hash } = j;
              let status, transactionHash;
              try {
                {
                  const result = await runSidechainTransaction(mnemonic)(
                    "NFT",
                    "updateHash",
                    oldHash,
                    hash
                  );
                  status = result.status;
                  transactionHash = "0x0";
                }
                if (status) {
                  let fileName = file.name || manualUrl.split("/").pop();
                  const extName = path.extname(fileName).slice(1);
                  fileName = extName
                    ? fileName.slice(0, -(extName.length + 1))
                    : fileName;
                  await Promise.all([
                    runSidechainTransaction(mnemonic)(
                      "NFT",
                      "setMetadata",
                      hash,
                      "name",
                      fileName
                    ),
                    runSidechainTransaction(mnemonic)(
                      "NFT",
                      "setMetadata",
                      hash,
                      "ext",
                      extName
                    ),
                  ]);
                  status = true;
                  transactionHash = "0x0";
                }
              } catch (err) {
                console.warn(err.stack);
                status = false;
                transactionHash = err.message;
              }

              if (status) {
                SendMessage(
                  id,
                  twitterUserId,
                  messageType,
                  "Updated " +
                    tokenId +
                    " to " +
                    hash +
                    ` https://webaverse.com/assets/${tokenId}`
                );
              } else {
                SendMessage(
                  id,
                  twitterUserId,
                  messageType,
                  "Update transaction failed: " + transactionHash
                );
              }
            });
          }
        );
        file.pipe(req);
      })
    );
  } else {
    SendMessage(id, twitterUserId, messageType, "No files to update!");
  }
};

const packs = async (id, twitterUserId, tokenId, messageType) => {
  tokenId = parseInt(tokenId, 10);
  let match;
  if (!isNaN(tokenId)) {
    const packedBalance = await contracts.NFT.methods
      .getPackedBalance(tokenId)
      .call();
    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Packed balance of #" + tokenId + ": " + packedBalance
    );
  } else {
    let address, userLabel;
    const _loadFromUserId = async (userId) => {
      const spec = await _getUser(userId);
      let mnemonic = spec.mnemonic;
      if (!mnemonic) {
        const spec = await _genKey(userId);
        mnemonic = spec.mnemonic;
      }

      const wallet = hdkey
        .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
        .derivePath(`m/44'/60'/0'/0/0`)
        .getWallet();
      address = wallet.getAddressString();

      userLabel = userId;
    };
    const _loadFromAddress = (a) => {
      address = a;
      userLabel = "`0x" + a + "`";
    };
    const _loadFromTreasury = () => {
      const wallet = hdkey
        .fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic))
        .derivePath(`m/44'/60'/0'/0/0`)
        .getWallet();
      address = wallet.getAddressString();
      userLabel = "treasury";
    };
    if (userOrNftId && (match = userOrNftId.match(/@([a-zA-Z0-9_])*/))) {
      await _loadFromUserId(match[0]);
    } else if (userOrNftId && (match = userOrNftId.match(/^0x([0-9a-f]+)$/i))) {
      _loadFromAddress(match[1]);
    } else if (userOrNftId >= 2 && userOrNftId === "treasury") {
      _loadFromTreasury();
    } else {
      await _loadFromUserId(twitterUserId);
    }

    const nftBalance = await contracts.NFT.methods.balanceOf(address).call();
    const packedBalances = [];
    for (let i = 0; i < nftBalance; i++) {
      const id = await contracts.NFT.methods
        .tokenOfOwnerByIndex(address, i)
        .call();
      const packedBalance = await contracts.NFT.methods
        .getPackedBalance(id)
        .call();
      if (packedBalance > 0) {
        packedBalances.push({
          id,
          packedBalance,
        });
      }
    }

    let s = userLabel + "'s packs:\n";
    if (packedBalances.length > 0) {
      s += packedBalances
        .map((pack, i) => `${pack.id}. contains ${pack.packedBalance} FT`)
        .join("\n");
    } else {
      s += "Packs empty";
    }
    SendMessage(id, twitterUserId, messageType, s);
  }
};

const pack = async (id, twitterUserId, nftId, amount, messageType) => {
  const tokenId = parseInt(nftId, 10);
  amount = parseInt(amount, 10);
  if (!isNaN(tokenId) && !isNaN(amount)) {
    let { mnemonic } = await _getUser(twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey(twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();

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

    let status;
    try {
      {
        let allowance = await contracts.FT.methods
          .allowance(address, contracts["NFT"]._address)
          .call();
        allowance = new web3.utils.BN(allowance, 10);
        if (allowance.lt(fullAmountD2.v)) {
          const result = await runSidechainTransaction(mnemonic)(
            "FT",
            "approve",
            contracts["NFT"]._address,
            fullAmount.v
          );
          status = result.status;
        } else {
          status = true;
        }
      }
      if (status) {
        const result = await runSidechainTransaction(mnemonic)(
          "NFT",
          "pack",
          address,
          tokenId,
          amount
        );
        status = result.status;
      }
    } catch (err) {
      console.warn(err);
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Packed " + amount + " into #" + tokenId
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Failed to pack FT into NFT: " + tokenId
      );
    }
  } else {
    SendMessage(id, twitterUserId, messageType, "Invalid token id: " + tokenId);
  }
};

const unpack = async (id, twitterUserId, nftId, amount, messageType) => {
  const tokenId = parseInt(nftId, 10);
  amount = parseInt(amount, 10);
  if (!isNaN(tokenId) && !isNaN(amount)) {
    let { mnemonic } = await _getUser(twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey(twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();

    const result = await runSidechainTransaction(mnemonic)(
      "NFT",
      "unpack",
      address,
      tokenId,
      amount
    );

    if (result.status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Unpacked " + amount + " from #" + tokenId
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Failed to unpack FT from NFT: " + tokenId
      );
    }
  } else {
    SendMessage(id, twitterUserId, messageType, "Invalid token id: " + nftId);
  }
};

const store = async (id, twitterUserId, user, messageType) => {
  let address;
  if (user >= 2 && (match = user.match(/@([a-zA-Z0-9_])*/))) {
    const userId = match[0];
    let { mnemonic } = await _getUser(userId);
    if (!mnemonic) {
      const spec = await _genKey(userId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    address = wallet.getAddressString();
  } else {
    address = treasuryAddress;
  }

  const booths = await getStores();

  let s = "";
  const booth = booths.find((booth) => booth.seller === address);
  if (booth && booth.entries.length > 0) {
    try {
      const [names, packedBalances] = await Promise.all([
        Promise.all(
          booth.entries.map(async (entry) => {
            const hash = await contracts.NFT.methods
              .getHash(entry.tokenId)
              .call();
            const name = await contracts.NFT.methods
              .getMetadata(hash, "name")
              .call();
            return name;
          })
        ),
        Promise.all(
          booth.entries.map(async (entry) => {
            const packedBalance = await contracts.NFT.methods
              .getPackedBalance(entry.tokenId)
              .call();
            return packedBalance;
          })
        ),
      ]);

      s +=
        (booth.seller !== treasuryAddress ? booth.seller : "treasury") +
        "'s store: " +
        booth.entries
          .map(
            (entry, i) =>
              `#${entry.id}: NFT ${entry.tokenId} (${names[i]}${
                packedBalances[i] > 0 ? " + " + packedBalances[i] + " FT" : ""
              }) for ${entry.price.toNumber()} FT`
          )
          .join("\n") +
        "";
    } catch (err) {
      console.warn(err);
    }
  } else {
    s +=
      (address !== treasuryAddress ? address : "treasury") + "'s store: empty";
  }
  SendMessage(id, twitterUserId, messageType, s);
};

const sell = async (id, twitterUserId, tokenId, price, messageType) => {
  price = parseInt(price, 10);
  if (isNaN(price)) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Invalid price for NFT ${tokenId}: ${price}`
    );
    return;
  }

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }
  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();

  const ownTokenIds = [];
  const nftBalance = await contracts.NFT.methods.balanceOf(address).call();
  for (let i = 0; i < nftBalance; i++) {
    const id = await contracts.NFT.methods
      .tokenOfOwnerByIndex(address, i)
      .call();
    ownTokenIds.push(id);
  }

  const treasuryTokenIds = [];

  // const store = await getStore();
  if (ownTokenIds.includes(tokenId)) {
    let status, buyId;
    try {
      const isApproved = await contracts.NFT.methods
        .isApprovedForAll(address, contracts["Trade"]._address)
        .call();
      if (!isApproved) {
        await runSidechainTransaction(mnemonic)(
          "NFT",
          "setApprovalForAll",
          contracts["Trade"]._address,
          true
        );
      }
      // buyId = await contracts.Trade.methods.addStore(tokenId, price).call();
      const buySpec = await runSidechainTransaction(mnemonic)(
        "Trade",
        "addStore",
        tokenId,
        price
      );
      // console.log('got buy spec', JSON.stringify(buySpec, null, 2));
      buyId = parseInt(buySpec.logs[0].topics[1]);

      status = true;
    } catch (err) {
      console.warn(err.stack);
      status = false;
      buyId = -1;
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Sale #" + buyId + ": NFT #" + tokenId + " for " + price + " SILK"
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Failed to list NFT #" + tokenId
      );
    }
  } else if (treasuryTokenIds.includes(tokenId)) {
    let status, buyId;
    try {
      const isApproved = await contracts.NFT.methods
        .isApprovedForAll(address, contracts["Trade"]._address)
        .call();
      if (!isApproved) {
        await runSidechainTransaction(treasuryMnemonic)(
          "NFT",
          "setApprovalForAll",
          contracts["Trade"]._address,
          true
        );
      }
      const buySpec = await runSidechainTransaction(treasuryMnemonic)(
        "Trade",
        "addStore",
        tokenId,
        price
      );
      buyId = parseInt(buySpec.logs[0].topics[1]);

      status = true;
    } catch (err) {
      console.warn(err.stack);
      status = false;
      buyId = -1;
    }

    if (status) {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Sale #" + buyId + ": NFT " + tokenId + " for " + price + " FT"
      );
    } else {
      SendMessage(
        id,
        twitterUserId,
        messageType,
        "Failed to list NFT #" + tokenId
      );
    }
  } else {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `You can't sell ${tokenId} because you don't own it`
    );
  }
};

const unsell = async (id, twitterUserId, buyId, messageType) => {
  buyId = parseInt(buyId, 10);
  if (isNaN(buyId)) {
    SendMessage(id, twitterUserId, messageType, "Invalid NFT ID: " + buyId);
    return;
  }

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }

  let status;
  try {
    await runSidechainTransaction(mnemonic)("Trade", "removeStore", buyId);

    status = true;
  } catch (err) {
    console.warn(err.stack);
    status = false;
  }

  if (status) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `NFT #${buyId} has been unlisted`
    );
  } else {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `ERROR: NFT #${buyId} could not been unlisted`
    );
  }
};

const buy = async (id, twitterUserId, buyId, messageType) => {
  buyId = parseInt(buyId, 10);

  let { mnemonic } = await _getUser(twitterUserId);
  if (!mnemonic) {
    const spec = await _genKey(twitterUserId);
    mnemonic = spec.mnemonic;
  }
  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const address = wallet.getAddressString();

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

  let status, tokenId, price;
  try {
    {
      let allowance = await contracts.FT.methods
        .allowance(address, contracts["Trade"]._address)
        .call();
      allowance = new web3.utils.BN(allowance, 10);
      if (allowance.lt(fullAmountD2.v)) {
        await runSidechainTransaction(mnemonic)(
          "FT",
          "approve",
          contracts["Trade"]._address,
          fullAmount.v
        );
      }
    }
    await runSidechainTransaction(mnemonic)("Trade", "buy", buyId);

    const store = await contracts.Trade.methods.getStoreByIndex(buyId).call();
    tokenId = parseInt(store.id, 10);
    price = new web3.utils.BN(store.price);

    status = true;
  } catch (err) {
    console.warn(err.stack);
    status = false;
  }

  if (status) {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Purchased NFT #${tokenId} for ${price.toNumber()} SILK`
    );
  } else {
    SendMessage(
      id,
      twitterUserId,
      messageType,
      `Failed to purchase NFT #${tokenId}`
    );
  }
};

const getBalance = async (id, twitterUserId, balanceUserId, messageType) => {
  let match;
  if (
    twitterUserId &&
    (match = (balanceUserId || twitterUserId).match(/@([a-zA-Z0-9_])*/))
  ) {
    const userId = match[0];
    let { mnemonic } = await _getUser(userId);
    if (!mnemonic) {
      const spec = await _genKey(userId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const balance = await contracts.FT.methods.balanceOf(address).call();
    SendMessage(
      id,
      twitterUserId,
      messageType,
      userId + " has " + balance + " SILK"
    );
  } else if ((balanceUserId || twitterUserId) === "treasury") {
    const balance = await contracts.FT.methods
      .balanceOf(treasuryAddress)
      .call();
    SendMessage(
      id,
      twitterUserId,
      messageType,
      "Treasury has " + balance + " SILK"
    );
  } else {
    let { mnemonic } = await _getUser(balanceUserId || twitterUserId);
    if (!mnemonic) {
      const spec = await _genKey(balanceUserId || twitterUserId);
      mnemonic = spec.mnemonic;
    }

    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const address = wallet.getAddressString();
    const balance = await contracts.FT.methods.balanceOf(address).call();
    SendMessage(
      id,
      twitterUserId,
      messageType,
      (balanceUserId || twitterUserId) + " has " + balance + " SILK"
    );
  }
};

const HandleResponse = (id, name, receivedMessage, messageType, event) => {
  const commandType = receivedMessage.split(" ")[0].replace(".", "");
  const commandArg1 = receivedMessage.split(" ")[1] || null;
  const commandArg2 = receivedMessage.split(" ")[2] || null;
  const commandArg3 = receivedMessage.split(" ")[3] || null;

  switch (commandType) {
    case "help":
      help(id, name, messageType);
      break;
    case "play":
      play(id, name, messageType);
      break;
    case "status":
      status(id, name, messageType);
      break;
    case "inventory":
      inventory(id, name, commandArg1, commandArg2, messageType);
      break;
    case "address":
      address(id, name, commandArg1, messageType);
      break;
    case "key":
      key(id, name, commandArg1, messageType);
      break;
    case "name":
      setName(id, name, commandArg1, messageType);
      break;
    case "balance":
      getBalance(id, name, commandArg1, messageType);
      break;
    case "monetizationPointer":
      monetizationPointer(id, name, commandArg1, messageType);
      break;
    case "avatar":
      avatar(id, name, commandArg1, messageType);
      break;
    case "homespace":
      homespace(id, name, commandArg1, messageType);
      break;
    case "send":
      send(id, name, commandArg1, commandArg2, messageType);
      break;
    case "transfer":
      transfer(id, name, commandArg1, commandArg2, commandArg3, messageType);
      break;
    case "preview":
      preview(id, name, commandArg1, messageType);
      break;
    case "gif":
      gif(id, name, commandArg1, messageType);
      break;
    case "wget":
      wget(id, name, commandArg1, messageType);
      break;
    case "get":
      get(id, name, commandArg1, commandArg2, messageType);
      break;
    case "set":
      set(id, name, commandArg1, commandArg2, commandArg3, messageType);
      break;
    case "mint":
      mint(id, name, commandArg1, commandArg2, event, messageType);
      break;
    case "update":
      update(id, name, commandArg1, commandArg2, event, messageType);
      break;
    case "packs":
      packs(id, name, commandArg1, messageType);
      break;
    case "pack":
      pack(id, name, commandArg1, commandArg2, messageType);
      break;
    case "unpack":
      unpack(id, name, commandArg1, commandArg2, messageType);
      break;
    case "store":
      store(id, name, commandArg1, messageType);
      break;
    case "sell":
      sell(id, name, commandArg1, commandArg2, messageType);
      break;
    case "unsell":
      unsell(id, name, commandArg1, messageType);
      break;
    case "buy":
      buy(id, name, commandArg1, messageType);
      break;
    default:
      SendMessage(
        id,
        name,
        messageType,
        `I don't understand. Try "help" for help.`
      );
  }
};

const validateWebhook = (token, auth) => {
  console.log("token");
  const responseToken = crypto
    .createHmac("sha256", auth)
    .update(token)
    .digest("base64");
  return { response_token: `sha256=${responseToken}` };
};

exports.createTwitterClient = async (
  web3In,
  contractsIn,
  getStoresFunction,
  runSidechainTransactionFunction,
  database,
  treasuryAddressIn
) => {
  if (twitterConfigInvalid)
    return console.warn(
      "*** No bot config found for Twitter client, skipping initialization"
    );
  treasuryAddress = treasuryAddressIn;
  ddb = database;
  getStores = getStoresFunction;
  runSidechainTransaction = runSidechainTransactionFunction;
  web3 = web3In;
  contracts = contractsIn;
  TwitClient = new require("twit")({
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    access_token: twitterAccessToken,
    access_token_secret: twitterAccessTokenSecret,
  });

  const webhook = new Autohook({
    token: twitterAccessToken,
    token_secret: twitterAccessTokenSecret,
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    ngrok_secret: ngrokToken,
    env: "dev",
    port: twitterWebhookPort,
  });
  await webhook.removeWebhooks();
  webhook.on("event", (event) => {
    if (
      typeof event.tweet_create_events !== "undefined" &&
      event.tweet_create_events[0].user.screen_name !== twitterId
    ) {
      console.log("************************** EVENT tweet_create_events");
      const id = event.tweet_create_events[0].user.id;
      const screenName = event.tweet_create_events[0].user.screen_name;
      const ReceivedMessage = event.tweet_create_events[0].text;
      const message = ReceivedMessage.replace("@" + twitterId + " ", "");
      HandleResponse(id, screenName, message, "Tweet", event);
    }

    if (typeof event.direct_message_events !== "undefined") {
      if (
        event.users[event.direct_message_events[0].message_create.sender_id]
          .screen_name !== twitterId
      ) {
        console.log("************************** EVENT direct_message_events");
        console.log(event.direct_message_events[0]);

        const id = event.direct_message_events[0].message_create.sender_id;
        const name =
          event.users[event.direct_message_events[0].message_create.sender_id]
            .screen_name;
        const ReceivedMessage =
          event.direct_message_events[0].message_create.message_data.text;

        HandleResponse(id, name, ReceivedMessage, "DM", event);
      }
    }
  });
  await webhook.start();
  await webhook.subscribe({
    oauth_token: twitterAccessToken,
    oauth_token_secret: twitterAccessTokenSecret,
    screen_name: twitterId,
  });

  // handle this
  http
    .createServer((req, res) => {
      const route = url.parse(req.url, true);

      if (!route.pathname) {
        return;
      }

      if (route.query.crc_token) {
        console.log("Validating webhook");
        console.log(route.query.crc_token);
        const crc = validateWebhook(
          route.query.crc_token,
          twitterConsumerSecret
        );
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(crc));
      }
    })
    .listen(serverPort);
};
