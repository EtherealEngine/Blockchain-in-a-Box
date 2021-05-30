const path = require('path');
const url = require('url');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const {randomBytes} = crypto;

const mime = require('mime');
const Discord = require('discord.js');

const dns = require('dns');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const Web3 = require('web3');
const bip39 = require('bip39');
const { Transaction } = require('@ethereumjs/tx');
const { default: Common } = require('@ethereumjs/common');
const { hdkey } = require('ethereumjs-wallet');
const prettyBytes = require('pretty-bytes');

const {encodeSecret, decodeSecret} = require('./encryption.js');
const { discordApiToken, tradeMnemonic, treasuryMnemonic, infuraProjectId, genesisNftStartId, genesisNftEndId, encryptionMnemonic } =
require('fs').existsSync('./config.json') ? require('./config.json') : {
    tradeMnemonic: process.env.tradeMnemonic,
    treasuryMnemonic: process.env.treasuryMnemonic,
    discordApiToken: process.env.discordApiToken,
    infuraProjectId: process.env.infuraProjectId,
    genesisNftStartId: process.env.genesisNftStartId,
    genesisNftEndId: process.env.genesisNftEndId,
    encryptionMnemonic: process.env.encryptionMnemonic
  }


// isCollaborator
// only collaborator can set
// only collaborator or owner can get

const { jsonParse } = require('./utilities.js');
const {usersTableName, prefix, storageHost, previewHost, previewExt, treasurerRoleName} = require('./constants.js');
const embedColor = '#000000';
const _commandToValue = ([name, args, description]) =>
  ['.' + name, args.join(' '), '-', description].join(' ');
const _commandToDescription = ([name, args, description]) =>
  '```css\n' +
    ['.' + name, args.join(' '), '-', description].join(' ') +
  '```';
const _commandsToValue = commands =>
  '```css\n' +
    commands.map(command => _commandToValue(command)).join('\n') +
  '```';
const helpFields = [
  {
    name: 'Info',
    shortname: 'info',
    commands: [
      ['status', [], 'show account details'],
      ['balance', ['[@user|0xaddr]?'], 'show FT balance'],
      ['inventory', ['[@user|0xaddr]?', '[page]?'], 'show NFTs'],
      ['address', ['[@user]?'], 'print address'],
      ['key', ['[@user]?'], 'private key (DM)'],
      ['login', [], 'login link (DM)'],
      ['play', [], 'play link (DM)'],
      ['realm', ['[num]'], 'play link to realm [1-5] (DM)'],
    ],
  },
  {
    name: 'Tokens',
    shortname: 'tokens',
    commands: [
      ['inspect', ['[id]'], 'inspect token details'],
      ['send', ['[@user|0xaddr|treasury]', '[amount]'], 'send [amount] of SILK to user/address'],
      ['transfer', ['[@user|0xaddr|treasury]', '[id]', '[quantity]?'], 'send NFT'],
      ['preview', ['[id]'], 'preview NFT [id]; .gif for gif'],
      ['wget', ['[id]'], 'get NFT [id] in DM'],
      ['get', ['[id]', '[key]'], 'get metadata for NFT'],
      ['set', ['[id]', '[key]', '[value]'], 'set metadata for NFT'],
      ['collab', ['[@user|0xaddr]', '[tokenId]'], 'add collaborator for [tokenId]'],
      ['uncollab', ['[@user|0xaddr]', '[tokenId]'], 'remove collaborator for [tokenId]'],
    ],
  },
  {
    name: 'Account',
    shortname: 'account',
    commands: [
      ['name', ['[newname]'], 'set name to [name]'],
      ['monetizationpointer', ['[mp]'], 'set monetization pointer'],
      ['avatar', ['[id]'], 'set avatar'],
      ['loadout', ['[num]', '[id]'], 'set loadout NFT [1-8] to [id]'],
      ['homespace', ['[id]'], 'set NFT as home space'],
      ['redeem', [], 'redeem NFT roles'],
    ],
  },
  {
    name: 'Minting',
    shortname: 'minting',
    commands: [
      ['mint', ['[count]?'], 'mint NFTs from file drag n drop'],
      ['mint', ['[count]?', '[url]'], 'mint NFTs from [url]'],
      ['update', ['[id] (upload comment)'], 'update nft content'],
    ],
  },
  {
    name: 'Packing',
    shortname: 'packing',
    commands: [
      ['packs', ['[@user|nftid]'], 'check packed NFT balances'],
      ['pack', ['[nftid]', '[amount]'], 'pack [amount] FT into [nftid]'],
      ['unpack', ['[nftid]', '[amount]'], 'unpack [amount] FT from [nftid]'],
    ],
  },
  {
    name: 'Trade',
    shortname: 'trade',
    commands: [
      ['trade', ['[@user|0xaddr]'], 'start a trade with'],
      ['addnft', ['[tradeid]', '[nftid]'], 'add NFT to trade [tradeid]'],
      ['removenft', ['[tradeid]', '[index]'], 'remove NFT [index] from trade [tradeid]'],
      ['addft', ['[tradeid]','[amount]'], 'add FT to trade [tradeid]'],
    ],
  },
  {
    name: 'Store',
    shortname: 'store',
    commands: [
      ['store', ['[@user]?'], 'show store'],
      ['sell', ['[nftid]', '[price]'], 'sell [nftid] for [price]'],
      ['unsell', ['[saleid]'], 'unlist [saleid]'],
      ['buy', ['[saleid]'], 'buy [saleid]'],
    ],
  },
  {
    name: 'Land',
    shortname: 'land',
    commands: [
      ['parcels', [], 'list owned parcels'],
      ['deploy', ['[parcelId]', '[nftId]'], 'deploy [nftId] to [parcelId]'],
      ['landcollab', ['[@user|0xaddr]', '[parcelId]'], 'add collaborator to [parcelId]'],
    ],
  },
  {
    name: 'Secure commands (DM the bot)',
    shortname: 'secure',
    commands: [
      ['key', ['[new mnemonic]'], 'set private key'],
      ['key', ['reset'], 'generate new private key'],
      ['gets/.sets', [''], 'encrypted get/set'],
    ],
  },
  {
    name: 'Help',
    shortname: 'help',
    commands: [
      ['help', ['[topic]'], 'show help on a topic (info, tokens, account, minting, packing, trade, store, land, secure)'],
    ],
  },
].map(o => {
  o.value = _commandsToValue(o.commands);
  return o;
});
const _findCommand = commandName => {
  let command = null;
  for (const helpField of helpFields) {
    for (const c of helpField.commands) {
      const [name, args, description] = c;
      if (name === commandName) {
        command = c;
        break;
      }
    }
    if (command !== null) {
      break;
    }
  }
  return command;
};

// encryption/decryption of unlocks

const _parseWords = s => {
  const words = [];
  const r = /\S+/g;
  let match;
  while (match = r.exec(s)) {
    words.push(match);
  }
  return words;
};

const unlockableKey = 'unlockable';

// locals

const trades = [];
const helps = [];
const inventories = [];
let nextTradeId = 0;

exports.createDiscordClient = (web3, contracts, getStores, runSidechainTransaction, ddb, treasuryAddress, abis, addresses) => {
    if (discordApiToken === undefined || discordApiToken === "" || discordApiToken === null)
        return console.warn("*** WARNING: Discord API token is not defined");

    const client = new Discord.Client();

    client.on('ready', async function () {
        console.log(`the client becomes ready to start`);
        console.log(`I am ready! Logged in as ${client.user.tag}!`);
        console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

        // console.log('got', client.guilds.cache.get(guildId).members.cache);

        client.on('messageReactionAdd', async (reaction, user) => {
            const { data, message, emoji } = reaction;
            // console.log('emoji identifier', message, data, emoji);
            if (user.id !== client.user.id && emoji.identifier === '%E2%9D%8C') { // x
                if (message.channel.type === 'dm') {
                    message.delete();
                } else {
                    let helpIndex, trade, index, inventoryIndex;
                    if ((helpIndex = helps.findIndex(help => help.id === message.id)) !== -1) {
                        const help = helps[helpIndex];
                        if (help.requester.id === user.id) {
                            help.delete();
                            helps.splice(helpIndex, 1);
                        }
                    } else if ((trade = trades.find(trade => trade.id === message.id)) && (index = trade.userIds.indexOf(user.id)) !== -1) {
                        trade.cancel();
                        trades.splice(trades.indexOf(trade), 1);
                    }
                }
            } else if (user.id !== client.user.id && emoji.identifier === '%E2%9C%85') { // white check mark
                const trade = trades.find(trade => trade.id === message.id);
                if (trade) {
                    const index = trade.userIds.indexOf(user.id);
                    if (index >= 0) {
                        trade.confirmations[index] = true;
                        trade.render();

                        if (trade.confirmations.every(confirmation => !!confirmation)) {
                            if (trade.confirmations2.every(confirmation => !!confirmation)) {
                                trade.finish();
                                trades.splice(trades.indexOf(trade), 1);
                            } else {
                                trade.react('💞');
                            }
                        }
                    }
                }
            } else if (user.id !== client.user.id && emoji.identifier === '%F0%9F%92%9E') { // rotating hearts
                const trade = trades.find(trade => trade.id === message.id);
                if (trade) {
                    const index = trade.userIds.indexOf(user.id);
                    if (index >= 0) {
                        trade.confirmations2[index] = true;
                        trade.render();

                        if (trade.confirmations.every(confirmation => !!confirmation) && trade.confirmations2.every(confirmation => !!confirmation)) {
                            trade.finish();
                            trades.splice(trades.indexOf(trade), 1);
                        }
                    }
                }
            } else if (user.id !== client.user.id && emoji.identifier === '%E2%97%80%EF%B8%8F') { // left arrow ◀️
                if ((inventoryIndex = inventories.findIndex(i => i.id === message.id)) !== -1) {
                  const inventory = inventories[inventoryIndex];
                  if (inventory.requester.id === user.id) {
                      inventory.left();
                  }
                }
            } else if (user.id !== client.user.id && emoji.identifier === '%E2%96%B6%EF%B8%8F') { // right arrow ▶️
                if ((inventoryIndex = inventories.findIndex(i => i.id === message.id)) !== -1) {
                  const inventory = inventories[inventoryIndex];
                  if (inventory.requester.id === user.id) {
                      inventory.right();
                  }
                }
            }
        });
        client.on('messageReactionRemove', async (reaction, user) => {
            const { data, message, emoji } = reaction;
            if (user.id !== client.user.id && emoji.identifier === '%E2%9C%85') { // white check mark
                let trade, index;
                if ((trade = trades.find(trade => trade.id === message.id)) && (index = trade.userIds.indexOf(user.id)) !== -1) {
                    trade.confirmations[index] = false;
                    trade.render();

                    const doneReactions = trade.reactions.cache.filter(reaction => reaction.emoji.identifier === '%F0%9F%92%9E');
                    // console.log('got done reactions', Array.from(doneReactions.values()).length);
                    try {
                        for (const reaction of doneReactions.values()) {
                            const users = Array.from(reaction.users.cache.values());
                            console.log('got reaction users', users.map(u => u.id));
                            for (const user of users) {
                                await reaction.users.remove(user.id);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to remove reactions.', error.stack);
                    }
                }
            } else if (user.id !== client.user.id && emoji.identifier === '%E2%97%80%EF%B8%8F') { // left arrow ◀️
                  if ((inventoryIndex = inventories.findIndex(i => i.id === message.id)) !== -1) {
                    const inventory = inventories[inventoryIndex];
                    if (inventory.requester.id === user.id) {
                        inventory.left();
                    }
                  }
              } else if (user.id !== client.user.id && emoji.identifier === '%E2%96%B6%EF%B8%8F') { // right arrow ▶️
                  if ((inventoryIndex = inventories.findIndex(i => i.id === message.id)) !== -1) {
                    const inventory = inventories[inventoryIndex];
                    if (inventory.requester.id === user.id) {
                        inventory.right();
                    }
                  }
              }
        });
        client.on('message', async message => {
            if (!message.author.bot) {
                const _getUser = async (id = message.author.id) => {
                    const tokenItem = await ddb.getItem({
                        TableName: usersTableName,
                        Key: {
                            email: { S: id + '.discordtoken' },
                        }
                    }).promise();

                    let mnemonic = (tokenItem.Item && tokenItem.Item.mnemonic) ? tokenItem.Item.mnemonic.S : null;
                    return { mnemonic };
                };
                const _genKey = async (id = message.author.id) => {
                    const mnemonic = bip39.generateMnemonic();

                    await ddb.putItem({
                        TableName: usersTableName,
                        Item: {
                            email: { S: id + '.discordtoken' },
                            mnemonic: { S: mnemonic },
                        }
                    }).promise();
                    return { mnemonic };
                };

                if (message.channel.type === 'text') {
                    // console.log('got message', message);

                    const _getPage = () => {
                        let page = parseInt(split[1], 10);
                        if (!isNaN(page)) {
                            split[2] = split[1];
                            split[1] = '';
                        } else {
                            page = parseInt(split[2], 10);
                            if (isNaN(page)) {
                                page = 1;
                            }
                        }
                        return page;
                    };
                    const _items = (contractName, page) => async getEntries => {
                        let address, userLabel, userName;
                        const _loadFromUserId = async userId => {
                            const spec = await _getUser(userId);
                            let mnemonic = spec.mnemonic;
                            if (!mnemonic) {
                                const spec = await _genKey(userId);
                                mnemonic = spec.mnemonic;
                            }

                            const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                            address = wallet.getAddressString();

                            userLabel = '<@!' + userId + '>';
                            const o = await Promise.all([
                              contracts.Account.methods.getMetadata(address, 'name').call(),
                              contracts.Account.methods.getMetadata(address, 'avatarPreview').call(),
                            ]);
                            userName = o[0];                           
                            avatarPreview = o[1];                           
                        };
                        const _loadFromAddress = async a => {
                            address = a;
                            userLabel = a;
                            userName = a;
                            avatarPreview = await contracts.Account.methods.getMetadata(address, 'avatarPreview').call();
                        };
                        const _loadFromTreasury = async () => {
                            const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                            address = wallet.getAddressString();
                            userLabel = 'treasury';
                            userName = userLabel;
                            avatarPreview = await contracts.Account.methods.getMetadata(address, 'avatarPreview').call();
                        };
                        if (split.length >= 2 && (match = split[1].match(/<@!?([0-9]+)>/))) {
                            await _loadFromUserId(match[1]);
                        } else if (split.length >= 2 && (match = split[1].match(/^(0x[0-9a-f]+)$/i))) {
                            await _loadFromAddress(match[1]);
                        } else if (split.length >= 2 && split[1] === 'treasury') {
                            await _loadFromTreasury();
                        } else {
                            await _loadFromUserId(message.author.id);
                        }

                        const nftBalance = await contracts[contractName].methods.balanceOf(address).call();
                        const maxEntriesPerPage = 10;
                        const numPages = Math.max(Math.ceil(nftBalance / maxEntriesPerPage), 1);
                        page = Math.min(Math.max(page, 1), numPages);
                        const startIndex = (page - 1) * maxEntriesPerPage;
                        const endIndex = Math.min(page * maxEntriesPerPage, nftBalance);

                        const entries = await getEntries(address, startIndex, endIndex);

                        return {
                          userLabel,
                          userName,
                          avatarPreview,
                          numPages,
                          entries,
                        };
                    };

                    /* if (/grease/.test(message.content)) {
                      message.author.send('i am NOT grease?!!!!');
                    } */
                    
                    const s = message.content;
                    const words = _parseWords(s);
                    const split = words.map(word => word[0]);
                    // console.log('got split', { words, split, s, first: split[0] });
                    const isHelp = split.length > 1 && split[split.length - 1] === '-h';
                    if (isHelp) {
                      const commandName = split[0].slice(1);
                      const command = _findCommand(commandName);
                      if (command) {
                        const [name, args, description] = command;
                        const exampleEmbed = new Discord.MessageEmbed()
                          .setColor(embedColor)
                          .setTitle('Webaverse Help')
                          .setURL(`https://docs.webaverse.com/`)
                          // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                          // .setDescription(description || 'This person is a noob without a description.')
                          // .setThumbnail(avatarPreview)
                          // .addField('Inline field title', 'Some value here', true)
                          // .setImage(avatarPreview)
                          // .setTimestamp()
                          // .setFooter('.help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
                          .addFields([
                            {
                              name,
                              value: _commandToDescription(command),
                            },
                          ]);
                        const m = await message.channel.send(exampleEmbed);
                        // m.react('❌');
                        // m.requester = message.author;
                        // helps.push(m);
                      } else {
                        console.warn('invalid command name', commandName);
                      }
                    } else {
                      if (split[0] === prefix + 'help') {
                        const name = split[1];
                        const exampleEmbed = new Discord.MessageEmbed()
                          .setColor(embedColor)
                          .setTitle('Webaverse Help')
                          .setURL(`https://docs.webaverse.com/`)
                          // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                          // .setDescription(description || 'This person is a noob without a description.')
                          // .setThumbnail(avatarPreview)
                          // .addField('Inline field title', 'Some value here', true)
                          // .setImage(avatarPreview)
                          // .setTimestamp()
                          // .setFooter('.help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
                        if (!name) {
                          exampleEmbed.addFields(helpFields);
                        } else {
                          const command = _findCommand(name);
                          if (command) {
                            exampleEmbed.addFields([
                              {
                                name,
                                value: _commandToDescription(command),
                              },
                            ]);
                          } else {
                            const helpField = helpFields.find(hf => hf.shortname === name) || helpFields.find(hf => hf.shortname === 'help');
                            exampleEmbed.addFields([
                              helpField,
                            ]);
                          }
                        }
                        const m = await message.channel.send(exampleEmbed);
                        m.react('❌');
                        m.requester = message.author;
                        helps.push(m);
                      } else if (split[0] === prefix + 'status') {
                          let userId, mnemonic;
                          if (split.length >= 2 && (match = split[1].match(/<@!?([0-9]+)>/))) {
                              userId = match[1];
                          } else {
                              userId = message.author.id;
                          }
                          const spec = await _getUser(userId);
                          mnemonic = spec.mnemonic;
                          if (!mnemonic) {
                              const spec = await _genKey(userId);
                              mnemonic = spec.mnemonic;
                          }

                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();
                          const [
                              name,
                              description,
                              avatarId,
                              homeSpaceId,
                              monetizationPointer,
                              avatarPreview,
                          ] = await Promise.all([
                              contracts.Account.methods.getMetadata(address, 'name').call(),
                              contracts.Account.methods.getMetadata(address, 'description').call(),
                              contracts.Account.methods.getMetadata(address, 'avatarId').call(),
                              contracts.Account.methods.getMetadata(address, 'homeSpaceId').call(),
                              contracts.Account.methods.getMetadata(address, 'monetizationPointer').call(),
                              contracts.Account.methods.getMetadata(address, 'avatarPreview').call(),
                          ]);

                          const exampleEmbed = new Discord.MessageEmbed()
                            .setColor(embedColor)
                            .setTitle(name)
                            .setURL(`https://webaverse.com/accounts/${address}`)
                            // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                            .setDescription(description || 'This person is a noob without a description.')
                            .setThumbnail(avatarPreview)
                            .addFields(
                              { name: 'avatar id', value: avatarId || '<none>' },
                              { name: 'homespace id', value: homeSpaceId || '<none>' },
                              { name: 'monetization pointer', value: monetizationPointer || '<none>' },
                            )
                            // .addField('Inline field title', 'Some value here', true)
                            .setImage(avatarPreview)
                            .setTimestamp()
                            .setFooter('.help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
                          const m = await message.channel.send(exampleEmbed);
                          m.react('❌');
                          m.requester = message.author;
                          helps.push(m);

                          // message.channel.send('<@!' + message.author.id + '>: ' + `\`\`\`Name: ${name}\nAvatar: ${avatarId}\nHome Space: ${homeSpaceId}\nMonetization Pointer: ${monetizationPointer}\n\`\`\``);
                      } else if (split[0] === prefix + 'inspect' && !isNaN(split[1])) {
                        const tokenId = parseInt(split[1], 10);
                        
                        const token = await contracts.NFT.methods.tokenByIdFull(tokenId).call();
                        // console.log('got token', token);
                        const minterAddress = token.minter.toLowerCase();
                        const [
                          unlockable,
                          minterName,
                          minterAvatarPreview,
                        ] = await Promise.all([
                          (async () => {
                            const key = unlockableKey;
                            const value = await contracts.NFT.methods.getMetadata(token.hash, key).call();
                            return !!value;
                          })(),
                          contracts.Account.methods.getMetadata(minterAddress, 'name').call(),
                          contracts.Account.methods.getMetadata(minterAddress, 'avatarPreview').call(),
                        ]);
                        const editionNumber = 1; // XXX hack
                        const collaborators = [token.owner]; // XXX hack
                        const sizeString = prettyBytes(100 * 1024); // XXX hack
                        const resolutionString = `${1024}x${768}`; // XXX hack
                        
                        const itemPreview = `https://preview.exokit.org/${token.hash}.${token.ext}/preview.png`;
                        
                        const exampleEmbed = new Discord.MessageEmbed()
                          .setColor(embedColor)
                          .setTitle(token.name)
                          .setURL(`https://webaverse.com/assets/${token.id}`)
                          .setAuthor(minterName || 'Anonymous', minterAvatarPreview, `https://webaverse.com/accounts/${minterAddress}`)
                          .setDescription(token.description || 'What a mysterious item.')
                          .setThumbnail(itemPreview)
                          .addFields(
                            { name: 'content hash', value: token.hash },
                            { name: 'edition number', value: editionNumber + ' (est.)' },
                            { name: 'edition size', value: token.totalSupply + '' },
                            { name: 'file type', value: token.ext },
                            { name: 'file size', value: sizeString + ' (est.)' },
                            { name: 'file resolution', value: resolutionString + ' (est.)' },
                            { name: 'collaborators', value: collaborators.join(', ') + ' (est.)' },
                            { name: 'has unlockable?', value: unlockable ? 'yes' : 'no' },
                          )
                          // .addField('Inline field title', 'Some value here', true)
                          .setImage(itemPreview)
                          .setTimestamp()
                          .setFooter('.help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
                        const m = await message.channel.send(exampleEmbed);
                        m.react('❌');
                        m.requester = message.author;
                        helps.push(m);
                      } else if (split[0] === prefix + 'name') {
                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          if (split[1]) {
                              let name = split[1];
                              if (/['"]{2}/.test(name)) {
                                  name = '';
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const result = await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'name', name);

                              message.channel.send('<@!' + message.author.id + '>: set name to ' + JSON.stringify(name));
                          } else {
                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const name = await contracts.Account.methods.getMetadata(address, 'name').call();

                              message.channel.send('<@!' + message.author.id + '>: name is ' + JSON.stringify(name));
                          }
                      } else if (split[0] === prefix + 'monetizationpointer') {
                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          if (split[1]) {
                              const monetizationPointer = split[1];

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const result = await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'monetizationPointer', monetizationPointer);

                              message.channel.send('<@!' + message.author.id + '>: set monetization pointer to ' + JSON.stringify(monetizationPointer));
                          } else {
                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const monetizationPointer = await contracts.Account.methods.getMetadata(address, 'monetizationPointer').call();

                              message.channel.send('<@!' + message.author.id + '>: monetization pointer is ' + JSON.stringify(monetizationPointer));
                          }
                      } else if (split[0] === prefix + 'avatar') {
                          const contentId = split[1];
                          const id = parseInt(contentId, 10);

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          if (!isNaN(id)) {
                              const hash = await contracts.NFT.methods.getHash(id).call();
                              const [
                                  name,
                                  ext,
                              ] = await Promise.all([
                                  contracts.NFT.methods.getMetadata(hash, 'name').call(),
                                  contracts.NFT.methods.getMetadata(hash, 'ext').call(),
                              ]);

                              // const avatarUrl = `${storageHost}/${hash.slice(2)}${ext ? ('.' + ext) : ''}`;
                              // const avatarFileName = avatarUrl.replace(/.*\/([^\/]+)$/, '$1');
                              const avatarPreview = `${previewHost}/${hash}${ext ? ('.' + ext) : ''}/preview.${previewExt}`;

                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarId', id + '');
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarName', name);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarExt', ext);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarPreview', avatarPreview);

                              message.channel.send('<@!' + message.author.id + '>: set avatar to ' + JSON.stringify(id));
                          } else if (contentId) {
                              const name = path.basename(contentId);
                              const ext = path.extname(contentId).slice(1);
                              const avatarPreview = `https://preview.exokit.org/[${contentId}]/preview.jpg`;

                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarId', contentId);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarName', name);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarExt', ext);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'avatarPreview', avatarPreview);

                              message.channel.send('<@!' + message.author.id + '>: set avatar to ' + JSON.stringify(contentId));
                          } else {
                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const avatarId = await contracts.Account.methods.getMetadata(address, 'avatarId').call();

                              message.channel.send('<@!' + message.author.id + '>: avatar is ' + JSON.stringify(avatarId));
                          }
                      } else if (split[0] === prefix + 'loadout') {
                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          const index = parseInt(split[1], 10);
                          const contentId = split[2];
                          const id = parseInt(contentId, 10);

                          async function getLoadout(address) {
                              const loadoutString = await contracts.Account.methods.getMetadata(address, 'loadout').call();
                              let loadout = jsonParse(loadoutString);
                              if (!Array.isArray(loadout)) {
                                  loadout = [];
                              }
                              while (loadout.length < 8) {
                                  loadout.push(null);
                              }
                              return loadout;
                          }

                          if (index >= 1 && index <= 8) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();

                              if (!isNaN(id)) {
                                  const hash = await contracts.NFT.methods.getHash(id).call();
                                  const [
                                      name,
                                      ext,
                                  ] = await Promise.all([
                                      contracts.NFT.methods.getMetadata(hash, 'name').call(),
                                      contracts.NFT.methods.getMetadata(hash, 'ext').call(),
                                  ]);

                                  const itemPreview = `${previewHost}/${hash}${ext ? ('.' + ext) : ''}/preview.${previewExt}`;

                                  const loadout = await getLoadout(address);
                                  loadout.splice(index - 1, 1, [
                                      id + '',
                                      name,
                                      ext,
                                      itemPreview
                                  ]);

                                  await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'loadout', JSON.stringify(loadout));

                                  message.channel.send('<@!' + message.author.id + '>: updated loadout');
                              } else {
                                  const o = url.parse(contentId);
                                  const match = o.path.match(/\/([^\/]+)$/);
                                  const fileName = match ? match[1] : '';
                                  const ext = path.extname(fileName).slice(1);
                                  const name = ext ? fileName.slice(0, -(ext.length + 1)) : fileName;

                                  if (ext) {
                                      const itemPreview = `${previewHost}/[${contentId}]/preview.${previewExt}`;

                                      const loadout = await getLoadout(address);
                                      loadout.splice(index - 1, 1, [
                                          contentId,
                                          name,
                                          ext,
                                          itemPreview
                                      ]);

                                      await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'loadout', JSON.stringify(loadout));

                                      message.channel.send('<@!' + message.author.id + '>: updated loadout');
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: content id is not `[number|URL with extension]`: ' + contentId);
                                  }
                              }
                          } else {
                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();

                              const loadout = await getLoadout(address);

                              message.channel.send('<@!' + message.author.id + '>: loadout:\n```' + loadout.map((item, index) => `${index + 1}: ${item !== null ? (`[${item[0]}] ${item[1]} ${item[2]}`) : 'empty'}`).join('\n') + '```');
                          }
                      } else if (split[0] === prefix + 'homespace') {
                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          const id = parseInt(split[1], 10);

                          if (!isNaN(id)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();

                              const hash = await contracts.NFT.methods.getHash(id).call();
                              const [
                                  name,
                                  ext,
                              ] = await Promise.all([
                                  contracts.NFT.methods.getMetadata(hash, 'name').call(),
                                  contracts.NFT.methods.getMetadata(hash, 'ext').call(),
                              ]);

                              // const homeSpaceUrl = `${storageHost}/${hash.slice(2)}${ext ? ('.' + ext) : ''}`;
                              // const homeSpaceFileName = homeSpaceUrl.replace(/.*\/([^\/]+)$/, '$1');
                              const homeSpacePreview = `${previewHost}/${hash}${ext ? ('.' + ext) : ''}/preview.${previewExt}`;

                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'homeSpaceId', id + '');
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'homeSpaceName', name);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'homeSpaceExt', ext);
                              await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'homeSpacePreview', homeSpacePreview);

                              message.channel.send('<@!' + message.author.id + '>: set home space to ' + id);
                          } else {
                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const homeSpaceUrl = await contracts.Account.methods.getMetadata(address, 'homeSpaceUrl').call();

                              message.channel.send('<@!' + message.author.id + '>: home space is ' + JSON.stringify(homeSpaceUrl));
                          }
                      } else if (split[0] === prefix + 'redeem') {
                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          const rinkebyWeb3 = new Web3(new Web3.providers.HttpProvider(`https://rinkeby.infura.io/v3/${infuraProjectId}`));
                          const signature = await contracts.Account.methods.getMetadata(address, 'mainnetAddress').call();
                          let mainnetAddress;
                          if (signature !== '') {
                            mainnetAddress = await rinkebyWeb3.eth.accounts.recover("Connecting mainnet address.", signature);
                          } else {
                            message.channel.send('<@!' + message.author.id + '>: no role redeemed.');
                            return;
                          }

                          let roleRedeemed = null;

                          const mainnetNft = new rinkebyWeb3.eth.Contract(abis['NFT'], addresses['mainnet']['NFT']);
                          const nftMainnetBalance = await mainnetNft.methods.balanceOf(mainnetAddress).call();

                          const mainnetPromises = Array(nftMainnetBalance);
                          for (let i = 0; i < nftMainnetBalance; i++) {
                            const token = await mainnetNft.methods.tokenOfOwnerByIndexFull(mainnetAddress, i).call();
                            mainnetPromises[i] = token;
                            if (token.id >= genesisNftStartId && token.id <= genesisNftEndId) {
                              const genesisRole = message.guild.roles.cache.find(role => role.name === "Genesis");
                              if (!message.member.roles.cache.has(genesisRole.id)) {
                                message.member.roles.add(genesisRole).catch(console.error);
                                roleRedeemed = "Genesis";
                              } else {
                                roleRedeemed = "You already had the Genesis role!";
                  }
                            }
                          }
                          const mainnetTokens = await Promise.all(mainnetPromises);

                          if (roleRedeemed) {
                            message.channel.send('<@!' + message.author.id + '>: redeemed role: ' + roleRedeemed);
                          } else {
                            message.channel.send('<@!' + message.author.id + '>: no role redeemed.');
                          }
                      } else if (split[0] === prefix + 'balance') {
                          let match;
                          if (split.length >= 2 && (match = split[1].match(/<@!?([0-9]+)>/))) {
                              const userId = match[1];
                              let { mnemonic } = await _getUser(userId);
                              if (!mnemonic) {
                                  const spec = await _genKey(userId);
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const balance = await contracts.FT.methods.balanceOf(address).call();

                              if (balance === "0") {
                                message.channel.send('<@!' + userId + '> has ' + balance + ' SILK. Want to get some SILK? Ask the Webaverse team: https://discord.gg/R5wqYhvv53');
                              } else {
                                message.channel.send('<@!' + userId + '> has ' + balance + ' SILK.');
                              }
                          } else if (split[1] === 'treasury') {
                              const balance = await contracts.FT.methods.balanceOf(treasuryAddress).call();

                              message.channel.send('treasury has ' + balance + ' SILK');
                          } else {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              const balance = await contracts.FT.methods.balanceOf(address).call();

                              if (balance === "0") {
                                message.channel.send('<@!' + message.author.id + '> has ' + balance + ' SILK. Want to get some SILK? Ask the Webaverse team: https://discord.gg/R5wqYhvv53');
                              } else {
                                message.channel.send('<@!' + message.author.id + '> has ' + balance + ' SILK.');
                              }
                          }
                      } else if (split[0] === prefix + 'address') {
                          let user, address, userLabel;
                          if (split[1] !== 'treasury') {
                              if (split[1] && (match = split[1].match(/<@!?([0-9]+)>/))) {
                                  const userId = match[1];
                                  const member = await message.channel.guild.members.fetch(userId);
                                  user = member ? member.user : null;
                              } else {
                                  user = message.author;
                              }
                              let mnemonic;
                              const spec = await _getUser(user.id);
                              if (spec.mnemonic) {
                                  mnemonic = spec.mnemonic;
                              } else {
                                  const spec = await _genKey(user.id);
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              address = wallet.getAddressString();

                              userLabel = '<@!' + user.id + '>';
                          } else {
                              address = treasuryAddress;
                              userLabel = 'treasury';
                          }

                          if (address) {
                              message.channel.send(userLabel + '\'s address: ```' + address + '```');
                          } else {
                              message.channel.send('no such user');
                          }
                      } else if (split[0] === prefix + 'send' && split.length >= 3 && !isNaN(parseFloat(split[2]))) {
                          const amount = parseFloat(split[2]);
                          if (match = split[1].match(/<@!?([0-9]+)>/)) {
                              const userId = match[1];
                              const member = await message.channel.guild.members.fetch(userId);
                              const user = member ? member.user : null;
                              if (user) {
                                  let mnemonic, mnemonic2;
                                  if (userId !== message.author.id) {
                                      {
                                          const userSpec = await _getUser();
                                          mnemonic = userSpec.mnemonic;
                                          if (!mnemonic) {
                                              const spec = await _genKey();
                                              mnemonic = spec.mnemonic;
                                          }
                                      }
                                      {
                                          const userSpec = await _getUser(user.id);
                                          mnemonic2 = userSpec.mnemonic;
                                          if (!mnemonic2) {
                                              const spec = await _genKey(userId);
                                              mnemonic2 = spec.mnemonic;
                                          }
                                      }
                                  } else {
                                      const treasurer = member.roles.cache.some(role => role.name === treasurerRoleName);
                                      if (treasurer) {
                                          mnemonic = treasuryMnemonic;
                                          {
                                              const userSpec = await _getUser();
                                              mnemonic2 = userSpec.mnemonic;
                                              if (!mnemonic2) {
                                                  const spec = await _genKey();
                                                  mnemonic2 = spec.mnemonic;
                                              }
                                          }
                                      } else {
                                          message.channel.send('<@!' + message.author.id + '>: you are not a treasurer');
                                          return;
                                      }
                                  }

                                  const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                  const address2 = wallet2.getAddressString();

                                  let status, transactionHash;
                                  try {
                                      const result = await runSidechainTransaction(mnemonic)('FT', 'transfer', address2, amount);
                                      status = result.status;
                                      transactionHash = result.transactionHash;
                                  } catch (err) {
                                      console.warn(err.stack);
                                      status = false;
                                      transactionHash = '0x0';
                                  }

                                  if (status) {
                                      message.channel.send('<@!' + message.author.id + '>: sent ' + amount + ' SILK to <@!' + userId + '>');
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                                  }
                              } else {
                                  message.channel.send('unknown user');
                              }
                          } else if (match = split[1].match(/(0x[0-9a-f]+)/i)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const address2 = match[1];

                              let status, transactionHash;
                              try {
                                  const result = await runSidechainTransaction(mnemonic)('FT', 'transfer', address2, amount);
                                  status = result.status;
                                  transactionHash = result.transactionHash;
                              } catch (err) {
                                  console.warn(err.stack);
                                  status = false;
                                  transactionHash = '0x0';
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: sent ' + amount + ' SILK to ' + address2);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                              }
                          } else if (split[1] === 'treasury') {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address2 = wallet2.getAddressString();

                              let status, transactionHash;
                              try {
                                  const result = await runSidechainTransaction(mnemonic)('FT', 'transfer', address2, amount);
                                  status = result.status;
                                  transactionHash = result.transactionHash;
                              } catch (err) {
                                  console.warn(err.stack);
                                  status = false;
                                  transactionHash = '0x0';
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: sent ' + amount + ' SILK to treasury');
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                              }
                          } else {
                              message.channel.send('unknown user');
                          }
                      } else if (split[0] === prefix + 'trade' && split.length >= 2) {
                          if (match = split[1].match(/<@!?([0-9]+)>/)) {
                              const userId = match[1];
                              const member = await message.channel.guild.members.fetch(userId);
                              const user = member ? member.user : null;
                              if (user) {
                                  const tradeId = ++nextTradeId;
                                  const headerLeft = '   Trade #' + tradeId + ' ' + message.author.username.padStart(8);
                                  const headerMiddle = ' | ';
                                  const headerRight = user.username.padStart(8);
                                  const header = headerLeft + headerMiddle + headerRight;
                                  const userIds = [message.author.id, userId];
                                  const fts = [0, 0];
                                  const nfts = [[], []];
                                  const confirmations = [false, false];
                                  const confirmations2 = [false, false];
                                  const cancelledSpec = { cancelled: false };
                                  const tradingSpec = { trading: false };
                                  const finishedSpec = { finished: false };
                                  const _renderFts = () => {
                                      let s = '';
                                      if (fts.some(ft => ft > 0)) {
                                          s += ((fts[0] ? ('+ ' + fts[0]) : '') + Array(headerLeft.length + 1).join(' ')).slice(0, headerLeft.length) +
                                              headerMiddle +
                                              ((fts[1] ? ('+ ' + fts[1]) : '') + Array(headerRight.length + 1).join(' ')).slice(0, headerRight.length) +
                                              '\n';
                                      }
                                      return s;
                                  };
                                  const _renderNfts = () => {
                                      let s = '';
                                      const maxNumItems = Math.max(nfts[0].length, nfts[1].length);
                                      for (let i = 0; i < maxNumItems; i++) {
                                          const rowItems = [nfts[0][i], nfts[1][i]];
                                          const label = (i + '.  ').slice(0, 3);
                                          s += (label + (rowItems[0] || '') + Array(headerLeft.length + 1).join(' ')).slice(0, headerLeft.length) +
                                              headerMiddle +
                                              ((rowItems[1] || '') + Array(headerRight.length + 1).join(' ')).slice(0, headerRight.length) +
                                              '\n';
                                      }
                                      return s;
                                  };
                                  const _renderConfirmations = () => {
                                      return ((confirmations[0] ? 'OK' : '') + Array(headerLeft.length + 1).join(' ')).slice(0, headerLeft.length) +
                                          Array(headerMiddle.length + 1).join(' ') +
                                          ((confirmations[1] ? 'OK' : '') + Array(headerRight.length + 1).join(' ')).slice(0, headerLeft.length) +
                                          '\n';
                                  };
                                  const _renderStatus = () => {
                                      return (cancelledSpec.cancelled ? '[CANCELLED]\n' : '') +
                                          (tradingSpec.trading ? '[TRADING...]\n' : '') +
                                          (finishedSpec.finished ? '[FINISHED]\n' : '');
                                  };
                                  const _render = () => {
                                      return '```' + header + '\n' + Array(header.length + 1).join('-') + '\n' + _renderFts() + _renderNfts() + _renderConfirmations() + _renderStatus() + '```'
                                  };
                                  const m = await message.channel.send(_render());
                                  m.react('✅')
                                      .then(() => m.react('❌'));
                                  m.tradeId = tradeId;
                                  m.userIds = userIds;
                                  m.fts = fts;
                                  m.nfts = nfts;
                                  m.confirmations = confirmations;
                                  m.confirmations2 = confirmations2;
                                  m.cancelledSpec = cancelledSpec;
                                  m.tradingSpec = tradingSpec;
                                  m.finishedSpec = finishedSpec;
                                  m.addFt = (userId, amount) => {
                                      const index = userIds.indexOf(userId);
                                      if (index >= 0) {
                                          m.fts[index] = amount;
                                          m.render();
                                      }
                                  };
                                  m.addNft = (userId, item) => {
                                      const index = userIds.indexOf(userId);
                                      if (index >= 0) {
                                          m.nfts[index].push(item);
                                          m.render();
                                      }
                                  };
                                  m.removeNft = (userId, itemNumber) => {
                                      const index = userIds.indexOf(userId);
                                      if (index >= 0) {
                                          m.nfts[index].splice(itemNumber, 1);
                                          m.render();
                                      }
                                  };
                                  m.render = () => {
                                      m.edit(_render());
                                  };
                                  m.cancel = () => {
                                      cancelledSpec.cancelled = true;
                                      m.render();
                                  };
                                  m.finish = async () => {
                                      tradingSpec.trading = true;
                                      m.render();

                                      const fullAmount = {
                                          t: 'uint256',
                                          v: new web3.utils.BN(1e9)
                                              .mul(new web3.utils.BN(1e9))
                                              .mul(new web3.utils.BN(1e9)),
                                      };
                                      const fullAmountD2 = {
                                          t: 'uint256',
                                          v: fullAmount.v.div(new web3.utils.BN(2)),
                                      };

                                      const mnemonics = [];
                                      const addresses = [];
                                      for (const userId of userIds) {
                                          let { mnemonic } = await _getUser(userId);
                                          if (!mnemonic) {
                                              const spec = await _genKey(userId);
                                              mnemonic = spec.mnemonic;
                                          }
                                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                          const address = wallet.getAddressString();

                                          {
                                              let allowance = await contracts.FT.methods.allowance(address, contracts['Trade']._address).call();
                                              allowance = new web3.utils.BN(allowance, 10);
                                              if (allowance.lt(fullAmountD2.v)) {
                                                  await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['Trade']._address, fullAmount.v);
                                              }
                                          }
                                          {
                                              const isApproved = await contracts.NFT.methods.isApprovedForAll(address, contracts['Trade']._address).call();
                                              if (!isApproved) {
                                                  await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
                                              }
                                          }

                                          mnemonics.push(mnemonic);
                                          addresses.push(address);
                                      }

                                      await runSidechainTransaction(tradeMnemonic)(
                                          'Trade',
                                          'trade',
                                          addresses[0], addresses[1],
                                          fts[0] !== undefined ? fts[0] : 0,
                                          fts[1] !== undefined ? fts[1] : 0,
                                          nfts[0][0] !== undefined ? nfts[0][0] : 0,
                                          nfts[1][0] !== undefined ? nfts[1][0] : 0,
                                          nfts[0][1] !== undefined ? nfts[0][1] : 0,
                                          nfts[1][1] !== undefined ? nfts[1][1] : 0,
                                          nfts[0][2] !== undefined ? nfts[0][2] : 0,
                                          nfts[1][2] !== undefined ? nfts[1][2] : 0
                                      );

                                      tradingSpec.trading = false;
                                      finishedSpec.finished = true;
                                      m.render();

                                      message.channel.send('```trade #' + tradeId + ' complete! enjoy!```');
                                  };
                                  trades.push(m);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: cannot find peer');
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid trade peer: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'store') {
                          let address;
                          if (split.length >= 2 && (match = split[1].match(/<@!?([0-9]+)>/))) {
                              const userId = match[1];
                              let { mnemonic } = await _getUser(userId);
                              if (!mnemonic) {
                                  const spec = await _genKey(userId);
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              address = wallet.getAddressString();
                          } else {
                              address = treasuryAddress;
                          }

                          const booths = await getStores();

                          let s = '';
                          const booth = booths.find(booth => booth.seller === address);
                          if (booth && booth.entries.length > 0) {
                              try {
                                  const [names, packedBalances] = await Promise.all([
                                      Promise.all(booth.entries.map(async entry => {
                                          const hash = await contracts.NFT.methods.getHash(entry.tokenId).call();
                                          const name = await contracts.NFT.methods.getMetadata(hash, 'name').call();
                                          return name;
                                      })),
                                      Promise.all(booth.entries.map(async entry => {
                                          const packedBalance = await contracts.NFT.methods.getPackedBalance(entry.tokenId).call();
                                          return packedBalance;
                                      })),
                                  ]);

                                  s += (booth.seller !== treasuryAddress ? booth.seller : 'treasury') + '\'s store: ```' + booth.entries.map((entry, i) => `#${entry.id}: NFT ${entry.tokenId} (${names[i]}${packedBalances[i] > 0 ? (' + ' + packedBalances[i] + ' FT') : ''}) for ${entry.price.toNumber()} FT`).join('\n') + '```';
                              } catch (err) {
                                  console.warn(err);
                              }
                          } else {
                              s += (address !== treasuryAddress ? address : 'treasury') + '\'s store: ```empty```';
                          }
                          message.channel.send(s);
                          /* } else if (split[0] === prefix + 'treasury') {
                            const member = await message.channel.guild.members.fetch(message.author.id);
                            const treasurer = member.roles.cache.some(role => role.name === treasurerRoleName);
                            message.channel.send('treasurer flag: ' + treasurer); */
                      } else if (split[0] === prefix + 'sell' && split.length >= 3) {
                          const tokenId = split[1];
                          let price = parseInt(split[2], 10);
                          if (!isNaN(price)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }
                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();

                              const ownTokenIds = [];
                              const nftBalance = await contracts.NFT.methods.balanceOf(address).call();
                              for (let i = 0; i < nftBalance; i++) {
                                  const id = await contracts.NFT.methods.tokenOfOwnerByIndex(address, i).call();
                                  ownTokenIds.push(id);
                              }

                              const treasuryTokenIds = [];
                              const member = await message.channel.guild.members.fetch(message.author.id);
                              const treasurer = member.roles.cache.some(role => role.name === treasurerRoleName);
                              if (treasurer) {
                                  const nftBalance = await contracts.NFT.methods.balanceOf(treasuryAddress).call();
                                  for (let i = 0; i < nftBalance; i++) {
                                      const id = await contracts.NFT.methods.tokenOfOwnerByIndex(treasuryAddress, i).call();
                                      treasuryTokenIds.push(id);
                                  }
                              }

                              // const store = await getStore();
                              if (ownTokenIds.includes(tokenId)) {
                                  let status, buyId;
                                  try {
                                      const isApproved = await contracts.NFT.methods.isApprovedForAll(address, contracts['Trade']._address).call();
                                      if (!isApproved) {
                                          await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
                                      }
                                      // buyId = await contracts.Trade.methods.addStore(tokenId, price).call();
                                      const buySpec = await runSidechainTransaction(mnemonic)('Trade', 'addStore', tokenId, price);
                                      // console.log('got buy spec', JSON.stringify(buySpec, null, 2));
                                      buyId = parseInt(buySpec.logs[0].topics[1]);

                                      status = true;
                                  } catch (err) {
                                      console.warn(err.stack);
                                      status = false;
                                      buyId = -1;
                                  }

                                  if (status) {
                                      message.channel.send('<@!' + message.author.id + '>: sale #' + buyId + ': NFT ' + tokenId + ' for ' + price + ' FT');
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: failed to list nft: ' + tokenId);
                                  }
                              } else if (treasuryTokenIds.includes(tokenId)) {
                                  let status, buyId;
                                  try {
                                      const isApproved = await contracts.NFT.methods.isApprovedForAll(address, contracts['Trade']._address).call();
                                      if (!isApproved) {
                                          await runSidechainTransaction(treasuryMnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
                                      }
                                      const buySpec = await runSidechainTransaction(treasuryMnemonic)('Trade', 'addStore', tokenId, price);
                                      buyId = parseInt(buySpec.logs[0].topics[1]);

                                      status = true;
                                  } catch (err) {
                                      console.warn(err.stack);
                                      status = false;
                                      buyId = -1;
                                  }

                                  if (status) {
                                      message.channel.send('<@!' + message.author.id + '>: sale #' + buyId + ': NFT ' + tokenId + ' for ' + price + ' FT');
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: failed to list nft: ' + tokenId);
                                  }
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: not your nft: ' + tokenId);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid price: ' + split[2]);
                          }
                      } else if (split[0] === prefix + 'unsell' && split.length >= 2) {
                          const buyId = parseInt(split[1], 10);
                          if (!isNaN(buyId)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }
                              // const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              // const address = wallet.getAddressString();

                              let status;
                              try {
                                  await runSidechainTransaction(mnemonic)('Trade', 'removeStore', buyId);

                                  status = true;
                              } catch (err) {
                                  console.warn(err.stack);
                                  status = false;
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: unlisted sell ' + buyId);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: unlist failed: ' + buyId);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid sell id: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'buy' && split.length >= 2) {
                          const buyId = parseInt(split[1], 10);

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }
                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          const fullAmount = {
                              t: 'uint256',
                              v: new web3.utils.BN(1e9)
                                  .mul(new web3.utils.BN(1e9))
                                  .mul(new web3.utils.BN(1e9)),
                          };
                          const fullAmountD2 = {
                              t: 'uint256',
                              v: fullAmount.v.div(new web3.utils.BN(2)),
                          };

                          let status, tokenId, price;
                          try {
                              {
                                  let allowance = await contracts.FT.methods.allowance(address, contracts['Trade']._address).call();
                                  allowance = new web3.utils.BN(allowance, 10);
                                  if (allowance.lt(fullAmountD2.v)) {
                                      await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['Trade']._address, fullAmount.v);
                                  }
                              }
                              await runSidechainTransaction(mnemonic)('Trade', 'buy', buyId);

                              const store = await contracts.Trade.methods.getStoreByIndex(buyId).call();
                              tokenId = parseInt(store.id, 10);
                              // const seller = store.seller.toLowerCase();
                              price = new web3.utils.BN(store.price);

                              status = true;
                          } catch (err) {
                              console.warn(err.stack);
                              status = false;
                          }

                          if (status) {
                              message.channel.send('<@!' + message.author.id + '>: got sale #' + tokenId + ' for ' + price.toNumber() + ' FT. noice!');
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: buy failed');
                          }

                          /* let booth = null;
                          let entry = null;
                          for (const b of store.booths) {
                            for (const e of b.entries) {
                              if (e.id === buyId) {
                                booth = b;
                                entry = e;
                                break;
                              }
                            }
                            if (entry) {
                              break;
                            }
                          }
                          if (entry) {
                            if (entry.userId !== message.author.id) {
                              const {tokenId, price} = entry;
              
                              let {mnemonic: userMnemonic} = await _getUser();
                              if (!userMnemonic) {
                                const spec = await _genKey();
                                userMnemonic = spec.mnemonic;
                              }
              
                              let boothMnemonic;
                              if (booth.address === treasuryAddress) {
                                boothMnemonic = treasuryMnemonic;
                              } else {
                                boothMnemonic = null;
                                const tokenItem = await ddb.query({
                                  TableName: usersTableName,
                                  IndexName: 'address-index',
                                  KeyConditionExpression: "#address = :addr",
                                  ExpressionAttributeNames:{
                                    '#address': 'address',
                                  },
                                  ExpressionAttributeValues: {
                                    ':addr': {
                                      S: booth.address,
                                    },
                                  },
                                }).promise();
                                if (tokenItem && tokenItem.Items && tokenItem.Items.length) {
                                  boothMnemonic = tokenItem.Items[0].mnemonic.S;
                                }
                                if (!boothMnemonic) {
                                  message.channel.send('<@!' + message.author.id + '>: failed to look up booth user');
                                  return;
                                }
                              }
              
                              const mnemonics = [userMnemonic, boothMnemonic];
                              const addresses = [];
                              for (const mnemonic of mnemonics) {
                                const fullAmount = {
                                  t: 'uint256',
                                  v: new web3.utils.BN(1e9)
                                    .mul(new web3.utils.BN(1e9))
                                    .mul(new web3.utils.BN(1e9)),
                                };
              
                                await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['Trade']._address, fullAmount.v);
                                await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
              
                                const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                const address = wallet.getAddressString();
                                addresses.push(address);
                              }
                              
                              let status;
                              try {
                                await runSidechainTransaction(mnemonic)(
                                  'Trade',
                                  'trade',
                                  addresses[0], addresses[1],
                                  price, 0,
                                  0, tokenId,
                                  0, 0,
                                  0, 0,
                                );
                                
                                status = true;
                              } catch (err) {
                                console.warn(err.stack);
                                status = false;
                              }
              
                              if (status) {
                                booth.entries.splice(booth.entries.indexOf(entry), 1);
                                await setStore(store);
                                message.channel.send('<@!' + message.author.id + '>: got sale #' + tokenId + ' for ' + price + '. noice!');
                              } else {
                                message.channel.send('<@!' + message.author.id + '>: buy failed');
                              }
                            } else {
                              message.channel.send('no such sale for user: ' + buyId);
                            }
                          } else {
                            message.channel.send('invalid buy id');
                          } */
                      } else if (split[0] === prefix + 'parcels') {
                          const page = _getPage();
                          const o = await _items('LAND', page)(async (address, startIndex, endIndex) => {
                              const promises = [];
                              for (let i = startIndex; i < endIndex; i++) {
                                  promises.push((async i => {
                                      const id = await contracts.LAND.methods.tokenOfOwnerByIndex(address, i).call();
                                      const [name, hash] = await Promise.all([
                                          contracts.LAND.methods.getHash(id).call(),
                                          contracts.LAND.methods.getSingleMetadata(id, 'hash').call(),
                                      ]);
                                      return {
                                          id,
                                          name,
                                          hash,
                                      };
                                  })(i));
                              }
                              const entries = await Promise.all(promises);
                              return entries;
                          }).catch(console.warn);
                          
                          const {
                            userLabel,
                            numPages,
                            entries,
                          } = o;
                          const _print = (userLabel, page, numPages, entries) => {
                              let s = userLabel + '\'s parcels:\n';
                              if (entries.length > 0) {
                                  s += `Page ${page}/${numPages}` + '\n';
                                  s += '```' + entries.map((entry, i) => `${entry.id}. ${entry.name} -> ${entry.hash}`).join('\n') + '```';
                              } else {
                                  s += '```no parcels owned```';
                              }
                              return s;
                          };
                          const s = _print(userLabel, page, numPages, entries);
                          const m = await message.channel.send(s);
                          m.react('❌');
                          m.requester = message.author;
                          helps.push(m);
                      } else if (split[0] === prefix + 'deploy' && split.length >= 3) {
                          const tokenId = parseInt(split[1], 10);
                          const contentId = split[2];

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          if (!isNaN(tokenId)) {
                              let status, transactionHash;
                              try {
                                  const result = await runSidechainTransaction(mnemonic)('LAND', 'setSingleMetadata', tokenId, 'hash', contentId);
                                  status = result.status;
                                  transactionHash = '0x0';
                              } catch (err) {
                                  console.warn(err);
                                  status = false;
                                  transactionHash = err.message;
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: deploy successful, sarge!');
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: deploy failed');
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid land nft: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'landcollab' && split.length >= 3) {
                          const tokenId = parseInt(split[2]);
                          if (match = split[1].match(/<@!?([0-9]+)>/)) {
                              const userId = match[1];
                              const member = await message.channel.guild.members.fetch(userId);
                              const user = member ? member.user : null;
                              if (user) {
                                  let mnemonic, mnemonic2;
                                  if (userId !== message.author.id) {
                                      {
                                          const userSpec = await _getUser();
                                          mnemonic = userSpec.mnemonic;
                                          if (!mnemonic) {
                                              const spec = await _genKey();
                                              mnemonic = spec.mnemonic;
                                          }
                                      }
                                      {
                                          const userSpec = await _getUser(user.id);
                                          mnemonic2 = userSpec.mnemonic;
                                          if (!mnemonic2) {
                                              const spec = await _genKey(userId);
                                              mnemonic2 = spec.mnemonic;
                                          }
                                      }
                                  }
                                  const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                  const address2 = wallet2.getAddressString();

                                  let status, transactionHash;
                                  try {
                                      const result = await runSidechainTransaction(mnemonic)('LAND', 'addSingleCollaborator', tokenId, address2);
                                      status = result.status;
                                      transactionHash = result.transactionHash;
                                  } catch (err) {
                                      console.warn(err.stack);
                                      status = false;
                                      transactionHash = '0x0';
                                  }

                                  if (status) {
                                      message.channel.send('<@!' + message.author.id + '>: added collaborator to LAND #' + tokenId + ': ' + address2);
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                                  }
                              } else {
                                  message.channel.send('unknown user');
                              }
                          } else if (match = split[1].match(/(0x[0-9a-f]+)/i)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const address2 = match[1];

                              let status, transactionHash;
                              try {
                                  const result = await runSidechainTransaction(mnemonic)('LAND', 'addSingleCollaborator', address2, tokenId);
                                  status = result.status;
                                  transactionHash = result.transactionHash;
                              } catch (err) {
                                  console.warn(err.stack);
                                  status = false;
                                  transactionHash = '0x0';
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: added collaborator to LAND #' + tokenId + ': ' + address2);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                              }
                          } else {
                              message.channel.send('unknown user');
                          }
                      } else if (split[0] === prefix + 'collab' && split.length >= 3) {
                          const tokenId = parseInt(split[2]);
                          const hash = await contracts.NFT.methods.getHash(tokenId).call();
                          if (match = split[1].match(/<@!?([0-9]+)>/)) {
                              const userId = match[1];
                              const member = await message.channel.guild.members.fetch(userId);
                              const user = member ? member.user : null;
                              if (user) {
                                  let mnemonic, mnemonic2;
                                  if (userId !== message.author.id) {
                                      {
                                          const userSpec = await _getUser();
                                          mnemonic = userSpec.mnemonic;
                                          if (!mnemonic) {
                                              const spec = await _genKey();
                                              mnemonic = spec.mnemonic;
                                          }
                                      }
                                      {
                                          const userSpec = await _getUser(user.id);
                                          mnemonic2 = userSpec.mnemonic;
                                          if (!mnemonic2) {
                                              const spec = await _genKey(userId);
                                              mnemonic2 = spec.mnemonic;
                                          }
                                      }
                                  }
                                  const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                  const address2 = wallet2.getAddressString();

                                  let status, transactionHash;
                                  try {
                                      const result = await runSidechainTransaction(mnemonic)('NFT', 'addCollaborator', hash, address2);
                                      status = result.status;
                                      transactionHash = result.transactionHash;
                                  } catch (err) {
                                      console.warn(err.stack);
                                      status = false;
                                      transactionHash = '0x0';
                                  }

                                  if (status) {
                                      message.channel.send('<@!' + message.author.id + '>: added collaborator to token #' + tokenId + ': ' + address2);
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                                  }
                              } else {
                                  message.channel.send('unknown user');
                              }
                          } else if (match = split[1].match(/(0x[0-9a-f]+)/i)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const address2 = match[1];

                              let status, transactionHash;
                              try {
                                  const result = await runSidechainTransaction(mnemonic)('NFT', 'addCollaborator', hash, address2);
                                  status = result.status;
                                  transactionHash = result.transactionHash;
                              } catch (err) {
                                  console.warn(err.stack);
                                  status = false;
                                  transactionHash = '0x0';
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: added collaborator to token #' + tokenId + ': ' + address2);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                              }
                          } else {
                              message.channel.send('unknown user');
                          }

                      } else if (split[0] === prefix + 'uncollab' && split.length >= 3) {
                        const tokenId = parseInt(split[2]);
                          const hash = await contracts.NFT.methods.getHash(tokenId).call();
                          if (match = split[1].match(/<@!?([0-9]+)>/)) {
                              const userId = match[1];
                              const member = await message.channel.guild.members.fetch(userId);
                              const user = member ? member.user : null;
                              if (user) {
                                  let mnemonic, mnemonic2;
                                  if (userId !== message.author.id) {
                                      {
                                          const userSpec = await _getUser();
                                          mnemonic = userSpec.mnemonic;
                                          if (!mnemonic) {
                                              const spec = await _genKey();
                                              mnemonic = spec.mnemonic;
                                          }
                                      }
                                      {
                                          const userSpec = await _getUser(user.id);
                                          mnemonic2 = userSpec.mnemonic;
                                          if (!mnemonic2) {
                                              const spec = await _genKey(userId);
                                              mnemonic2 = spec.mnemonic;
                                          }
                                      }
                                  }
                                  const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                  const address2 = wallet2.getAddressString();

                                  let status, transactionHash;
                                  try {
                                      console.log('got hash 4.1', address2, hash);
                                      const result = await runSidechainTransaction(mnemonic)('NFT', 'removeCollaborator', hash, address2);
                                      console.log('got hash 4.2', address2, result);
                                      status = result.status;
                                      transactionHash = result.transactionHash;
                                  } catch (err) {
                                      console.warn(err.stack);
                                      status = false;
                                      transactionHash = '0x0';
                                  }

                                  if (status) {
                                      message.channel.send('<@!' + message.author.id + '>: removed collaborator from token #' + tokenId + ': ' + address2);
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                                  }
                              } else {
                                  message.channel.send('unknown user');
                              }
                          } else if (match = split[1].match(/(0x[0-9a-f]+)/i)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const address2 = match[1];

                              let status, transactionHash;
                              try {
                                  const result = await runSidechainTransaction(mnemonic)('NFT', 'removeCollaborator', hash, address2);
                                  status = result.status;
                                  transactionHash = result.transactionHash;
                              } catch (err) {
                                  console.warn(err.stack);
                                  status = false;
                                  transactionHash = '0x0';
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: added collaborator to token #' + tokenId + ': ' + address2);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: could not send: ' + transactionHash);
                              }
                          } else {
                              message.channel.send('unknown user');
                          }
                      } else if (split[0] === prefix + 'addnft' && split.length >= 3) {
                          const tradeId = parseInt(split[1], 10);
                          const trade = trades.find(trade => trade.tradeId === tradeId);
                          if (trade) {
                              const index = trade.userIds.indexOf(message.author.id);
                              if (index >= 0) {
                                  const id = split[2];
                                  const amount = 1;

                                  if (!trade.nfts[index].includes(id)) {
                                      const hash = await contracts.NFT.methods.getHash(id).call();
                                      if (hash) {
                                          let { mnemonic } = await _getUser();
                                          if (!mnemonic) {
                                              const spec = await _genKey();
                                              mnemonic = spec.mnemonic;
                                          }
                                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                          const address = wallet.getAddressString();

                                          const balance = await contracts.NFT.methods.balanceOfHash(address, hash).call();

                                          if (balance > 0) {
                                              if (trade.nfts[index].length < 3) {
                                                  trade.addNft(message.author.id, id);

                                                  const doneReactions = trade.reactions.cache.filter(reaction => reaction.emoji.identifier === '%E2%9C%85');
                                                  try {
                                                      for (const reaction of doneReactions.values()) {
                                                          const users = Array.from(reaction.users.cache.values());
                                                          for (const user of users) {
                                                              if (user.id !== client.user.id) {
                                                                  await reaction.users.remove(user.id);
                                                              }
                                                          }
                                                      }
                                                  } catch (error) {
                                                      console.error('Failed to remove reactions.', error.stack);
                                                  }
                                              } else {
                                                  message.channel.send('<@!' + message.author.id + '>: too many nfts in trade: ' + split[1]);
                                              }
                                          } else {
                                              message.channel.send('<@!' + message.author.id + '>: not your nft: ' + id);
                                          }
                                      } else {
                                          message.channel.send('<@!' + message.author.id + '>: invalid nft: ' + id);
                                      }
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: already trading nft: ' + id);
                                  }
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: not your trade: ' + split[1]);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid trade: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'removenft' && split.length >= 3) {
                          const tradeId = parseInt(split[1], 10);
                          const trade = trades.find(trade => trade.tradeId === tradeId);
                          if (trade) {
                              const index = trade.userIds.indexOf(message.author.id);
                              if (index >= 0) {
                                  const itemNumber = parseInt(split[2], 10);
                                  if (itemNumber >= 0 && itemNumber < trade.nfts.length) {
                                      trade.removeNft(message.author.id, itemNumber);

                                      const doneReactions = trade.reactions.cache.filter(reaction => reaction.emoji.identifier === '%E2%9C%85');
                                      try {
                                          for (const reaction of doneReactions.values()) {
                                              const users = Array.from(reaction.users.cache.values());
                                              for (const user of users) {
                                                  if (user.id !== client.user.id) {
                                                      await reaction.users.remove(user.id);
                                                  }
                                              }
                                          }
                                      } catch (error) {
                                          console.error('Failed to remove reactions.', error.stack);
                                      }
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: invalid trade nft index: ' + split[2]);
                                  }
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: not your trade: ' + split[1]);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid trade: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'addft' && split.length >= 3) {
                          const tradeId = parseInt(split[1], 10);
                          const trade = trades.find(trade => trade.tradeId === tradeId);
                          if (trade) {
                              const index = trade.userIds.indexOf(message.author.id);
                              if (index >= 0) {
                                  const amount = parseFloat(split[2]);
                                  console.log('got amount', amount);
                                  if (!isNaN(amount)) {
                                      let { mnemonic } = await _getUser();
                                      if (!mnemonic) {
                                          const spec = await _genKey();
                                          mnemonic = spec.mnemonic;
                                      }

                                      const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                      const address = wallet.getAddressString();
                                      const balance = await contracts.FT.methods.balanceOf(address).call();

                                      console.log('got balance', balance);

                                      if (balance >= amount) {
                                          trade.addFt(message.author.id, amount);

                                          const doneReactions = trade.reactions.cache.filter(reaction => reaction.emoji.identifier === '%E2%9C%85');
                                          try {
                                              for (const reaction of doneReactions.values()) {
                                                  const users = Array.from(reaction.users.cache.values());
                                                  for (const user of users) {
                                                      if (user.id !== client.user.id) {
                                                          await reaction.users.remove(user.id);
                                                      }
                                                  }
                                              }
                                          } catch (error) {
                                              console.error('Failed to remove reactions.', error.stack);
                                          }
                                      } else {
                                          message.channel.send('<@!' + message.author.id + '>: insufficient ft balance: ' + split[2]);
                                      }
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: invalid amount: ' + split[2]);
                                  }
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: not your trade: ' + split[1]);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid trade: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'packs') {
                          const tokenId = parseInt(split[1], 10);
                          let match;
                          if (!isNaN(tokenId)) {
                              const packedBalance = await contracts.NFT.methods.getPackedBalance(tokenId).call();
                              message.channel.send('<@!' + message.author.id + '>: packed balance of #' + tokenId + ': ' + packedBalance);
                          } else {
                              let address, userLabel;
                              const _loadFromUserId = async userId => {
                                  const spec = await _getUser(userId);
                                  let mnemonic = spec.mnemonic;
                                  if (!mnemonic) {
                                      const spec = await _genKey(userId);
                                      mnemonic = spec.mnemonic;
                                  }

                                  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                  address = wallet.getAddressString();

                                  userLabel = '<@!' + userId + '>';
                              };
                              const _loadFromAddress = a => {
                                  address = a;
                                  userLabel = '`0x' + a + '`';
                              };
                              const _loadFromTreasury = () => {
                                  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                  address = wallet.getAddressString();
                                  userLabel = 'treasury';
                              };
                              if (split.length >= 2 && (match = split[1].match(/<@!?([0-9]+)>/))) {
                                  await _loadFromUserId(match[1]);
                              } else if (split.length >= 2 && (match = split[1].match(/^0x([0-9a-f]+)$/i))) {
                                  _loadFromAddress(match[1]);
                              } else if (split.length >= 2 && split[1] === 'treasury') {
                                  _loadFromTreasury();
                              } else {
                                  await _loadFromUserId(message.author.id);
                              }

                              const nftBalance = await contracts.NFT.methods.balanceOf(address).call();
                              const packedBalances = [];
                              for (let i = 0; i < nftBalance; i++) {
                                  const id = await contracts.NFT.methods.tokenOfOwnerByIndex(address, i).call();
                                  const packedBalance = await contracts.NFT.methods.getPackedBalance(id).call();
                                  if (packedBalance > 0) {
                                      packedBalances.push({
                                          id,
                                          packedBalance,
                                      });
                                  }
                              }

                              let s = userLabel + '\'s packs:\n';
                              if (packedBalances.length > 0) {
                                  s += '```' + packedBalances.map((pack, i) => `${pack.id}. contains ${pack.packedBalance} FT`).join('\n') + '```';
                              } else {
                                  s += '```packs empty```';
                              }
                              const m = await message.channel.send(s);
                              m.react('❌');
                              m.requester = message.author;
                              helps.push(m);
                          }
                      } else if (split[0] === prefix + 'pack' && split.length >= 3) {
                          const tokenId = parseInt(split[1], 10);
                          const amount = parseInt(split[2], 10);
                          if (!isNaN(tokenId) && !isNaN(amount)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();

                              const fullAmount = {
                                  t: 'uint256',
                                  v: new web3.utils.BN(1e9)
                                      .mul(new web3.utils.BN(1e9))
                                      .mul(new web3.utils.BN(1e9)),
                              };
                              const fullAmountD2 = {
                                  t: 'uint256',
                                  v: fullAmount.v.div(new web3.utils.BN(2)),
                              };

                              let status;
                              try {
                                  {
                                      let allowance = await contracts.FT.methods.allowance(address, contracts['NFT']._address).call();
                                      allowance = new web3.utils.BN(allowance, 10);
                                      if (allowance.lt(fullAmountD2.v)) {
                                          const result = await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['NFT']._address, fullAmount.v);
                                          status = result.status;
                                      } else {
                                          status = true;
                                      }
                                  }
                                  if (status) {
                                      const result = await runSidechainTransaction(mnemonic)('NFT', 'pack', address, tokenId, amount);
                                      status = result.status;
                                  }
                              } catch (err) {
                                  console.warn(err);
                              }

                              if (status) {
                                  message.channel.send('<@!' + message.author.id + '>: packed ' + amount + ' into #' + tokenId);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: failed to pack FT into NFT: ' + tokenId);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid token id: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'unpack' && split.length >= 3) {
                          const tokenId = parseInt(split[1], 10);
                          const amount = parseInt(split[2], 10);
                          if (!isNaN(tokenId) && !isNaN(amount)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();

                              const result = await runSidechainTransaction(mnemonic)('NFT', 'unpack', address, tokenId, amount);

                              if (result.status) {
                                  message.channel.send('<@!' + message.author.id + '>: unpacked ' + amount + ' from #' + tokenId);
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: failed to unpack FT from NFT: ' + tokenId);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid token id: ' + split[1]);
                          }
                      } else if (split[0] === prefix + 'transfer' && split.length >= 3) {
                          const id = parseInt(split[2], 10);
                          if (!isNaN(id)) {
                              let quantity = split[3] ? parseInt(split[3], 10) : 1;
                              if (!isNaN(quantity)) {
                                  if (match = split[1].match(/<@!?([0-9]+)>/)) {
                                      const userId = match[1];
                                      const member = await message.channel.guild.members.fetch(userId);
                                      const user = member ? member.user : null;
                                      if (user) {
                                          let mnemonic, mnemonic2;
                                          if (userId !== message.author.id) {
                                              {
                                                  const userSpec = await _getUser();
                                                  mnemonic = userSpec.mnemonic;
                                                  if (!mnemonic) {
                                                      const spec = await _genKey();
                                                      mnemonic = spec.mnemonic;
                                                  }
                                              }
                                              {
                                                  const userSpec = await _getUser(user.id);
                                                  mnemonic2 = userSpec.mnemonic;
                                                  if (!mnemonic2) {
                                                      const spec = await _genKey(userId);
                                                      mnemonic2 = spec.mnemonic;
                                                  }
                                              }
                                          } else {
                                              const treasurer = member.roles.cache.some(role => role.name === treasurerRoleName);
                                              if (treasurer) {
                                                  mnemonic = treasuryMnemonic;
                                                  {
                                                      const userSpec = await _getUser();
                                                      mnemonic2 = userSpec.mnemonic;
                                                      if (!mnemonic2) {
                                                          const spec = await _genKey();
                                                          mnemonic2 = spec.mnemonic;
                                                      }
                                                  }
                                              } else {
                                                  message.channel.send('<@!' + message.author.id + '>: you are not a treasurer');
                                                  return;
                                              }
                                          }

                                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                          const address = wallet.getAddressString();

                                          const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic2)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                          const address2 = wallet2.getAddressString();

                                          let status = true, transactionHash;
                                          try {
                                              const hash = await contracts.NFT.methods.getHash(id).call();

                                              const ids = [];
                                              const nftBalance = await contracts.NFT.methods.balanceOf(address).call();
                                              for (let i = 0; i < nftBalance; i++) {
                                                  const id = await contracts.NFT.methods.tokenOfOwnerByIndex(address, i).call();
                                                  const hash2 = await contracts.NFT.methods.getHash(id).call();
                                                  if (hash2 === hash) {
                                                      ids.push(id);
                                                  }
                                              }
                                              ids.sort();

                                              if (ids.length >= quantity) {
                                                  const isApproved = await contracts.NFT.methods.isApprovedForAll(address, contracts['Trade']._address).call();
                                                  if (!isApproved) {
                                                      await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
                                                  }

                                                  for (let i = 0; i < quantity; i++) {
                                                      const id = ids[i];
                                                      const result = await runSidechainTransaction(mnemonic)('NFT', 'transferFrom', address, address2, id);
                                                      status = status && result.status;
                                                      transactionHash = result.transactionHash;
                                                  }
                                              } else {
                                                  status = false;
                                                  transactionHash = 'insufficient nft balance';
                                              }
                                          } catch (err) {
                                              console.warn(err.stack);
                                              status = false;
                                              transactionHash = '0x0';
                                          }

                                          if (status) {
                                              message.channel.send('<@!' + message.author.id + '>: transferred ' + id + (quantity > 1 ? `(x${quantity})` : '') + ' to <@!' + userId + '>');
                                          } else {
                                              message.channel.send('<@!' + message.author.id + '>: could not transfer: ' + transactionHash);
                                          }
                                      } else {
                                          message.channel.send('unknown user');
                                      }
                                  } else if (match = split[1].match(/^(0x[0-9a-f]+)$/i)) {
                                      let { mnemonic } = await _getUser();
                                      if (!mnemonic) {
                                          const spec = await _genKey();
                                          mnemonic = spec.mnemonic;
                                      }

                                      const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                      const address = wallet.getAddressString();

                                      const address2 = match[1];

                                      let status = true;
                                      for (let i = 0; i < quantity; i++) {
                                          try {
                                              const isApproved = await contracts.NFT.methods.isApprovedForAll(address, contracts['Trade']._address).call();
                                              if (!isApproved) {
                                                  await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
                                              }

                                              const result = await runSidechainTransaction(mnemonic)('NFT', 'transferFrom', address, address2, id);
                                              status = status && result.status;
                                          } catch (err) {
                                              console.warn(err.stack);
                                              status = false;
                                              break;
                                          }
                                      }

                                      if (status) {
                                          message.channel.send('<@!' + message.author.id + '>: transferred ' + id + ' to ' + address2);
                                      } else {
                                          message.channel.send('<@!' + message.author.id + '>: could not transfer: ' + status);
                                      }
                                  } else if (split[1] === 'treasury') {
                                      let { mnemonic } = await _getUser();
                                      if (!mnemonic) {
                                          const spec = await _genKey();
                                          mnemonic = spec.mnemonic;
                                      }

                                      const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                      const address = wallet.getAddressString();

                                      const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(treasuryMnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                      const address2 = wallet2.getAddressString();

                                      let status = true;
                                      for (let i = 0; i < quantity; i++) {
                                          try {
                                              const isApproved = await contracts.NFT.methods.isApprovedForAll(address, contracts['Trade']._address).call();
                                              if (!isApproved) {
                                                  await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['Trade']._address, true);
                                              }

                                              const result = await runSidechainTransaction(mnemonic)('NFT', 'transferFrom', address, address2, id);
                                              status = status && result.status;
                                          } catch (err) {
                                              console.warn(err.stack);
                                              status = false;
                                              break;
                                          }
                                      }

                                      if (status) {
                                          message.channel.send('<@!' + message.author.id + '>: transferred ' + id + ' to treasury');
                                      } else {
                                          message.channel.send('<@!' + message.author.id + '>: could not transfer');
                                      }
                                  } else {
                                      message.channel.send('unknown user');
                                  }
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: invalid quantity: ' + split[3]);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid token id: ' + split[2]);
                          }
                      } else if (split[0] === prefix + 'inventory') {
                          let mnemonic;
                          const spec = await _getUser(message.author.id);
                          mnemonic = spec.mnemonic;
                          if (!mnemonic) {
                              const spec = await _genKey(message.author.id);
                              mnemonic = spec.mnemonic;
                          }

                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          let pageIndex = 1;
                          let m = null;
                          const _renderMessage = ({
                            userName,
                            avatarPreview,
                            page,
                            numPages,
                            entries,
                          }) => {
                            return new Discord.MessageEmbed()
                              .setColor(embedColor)
                              .setTitle(`${userName}'s inventory`)
                              // .setURL(`https://webaverse.com/accounts/${address}`)
                              .setAuthor(userName, avatarPreview, `https://webaverse.com/accounts/${address}`)
                              // .setDescription(description || 'This person is a noob without a description.')
                              // .setThumbnail(avatarPreview)
                              // .addField('Inline field title', 'Some value here', true)
                              // .setImage(avatarPreview)
                              // .setTimestamp()
                              // .setFooter('.help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
                              .addFields(entries.map(entry => {
                                return {
                                  name: `${entry.id}) ${entry.name}.${entry.ext}`,
                                  value: ` ${entry.hash} (${entry.balance}/${entry.totalSupply}) [${entry.ids.join(',')}]`,
                                  // inline: true,
                                };
                              }).concat([
                                {
                                  name: 'page',
                                  value: `${page}/${numPages}`,
                                },
                              ]));
                          };
                          const _render = async () => {
                            const o = await _items('NFT', pageIndex)(async (address, startIndex, endIndex) => {
                              const hashToIds = {};
                              const promises = [];
                              for (let i = startIndex; i < endIndex; i++) {
                                  promises.push((async i => {
                                      const id = await contracts.NFT.methods.tokenOfOwnerByIndex(address, i).call();
                                      const hash = await contracts.NFT.methods.getHash(id).call();
                                      if (!hashToIds[hash]) {
                                          hashToIds[hash] = [];
                                      }
                                      hashToIds[hash].push(id);
                                  })(i));
                              }
                              await Promise.all(promises);

                              const entries = [];
                              await Promise.all(Object.keys(hashToIds).map(async hash => {
                                  const ids = hashToIds[hash].sort();
                                  const id = ids[0];
                                  const [
                                      name,
                                      ext,
                                      totalSupply,
                                  ] = await Promise.all([
                                      contracts.NFT.methods.getMetadata(hash, 'name').call(),
                                      contracts.NFT.methods.getMetadata(hash, 'ext').call(),
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
                              }));
                              entries.sort((a, b) => a.id - b.id);
                              return entries;
                          }).catch(console.warn);
                          const {
                            userLabel,
                            userName,
                            avatarPreview,
                            numPages,
                            entries,
                          } = o;
                          const exampleEmbed = _renderMessage({
                            userName,
                            avatarPreview,
                            page: pageIndex,
                            numPages,
                            entries,
                          });
                          
                          if (!m) {
                            m = await message.channel.send(exampleEmbed);
                            m.react('◀️');
                            m.react('▶️');
                            m.requester = message.author;
                            m.left = () => {
                              pageIndex--;
                              if (pageIndex < 1) {
                                pageIndex = numPages;
                              }
                              _render();
                            };
                            m.right = () => {
                              pageIndex++;
                              if (pageIndex > numPages) {
                                pageIndex = 1;
                              }
                              _render();
                            };
                            inventories.push(m);
                            
                            m.react('❌');
                            m.requester = message.author;
                            helps.push(m);
                          } else {
                            await m.edit(exampleEmbed);
                          }
                        };
                        _render();
                      } else if (split[0] === prefix + 'wget' && split.length >= 2 && !isNaN(parseInt(split[1], 10))) {
                          const id = parseInt(split[1], 10);

                          if (!isNaN(id)) {
                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                              const address = wallet.getAddressString();
                              let owner = await contracts.NFT.methods.ownerOf(id).call();
                              owner = owner.toLowerCase();
                              if (owner === address) {
                                  const hash = await contracts.NFT.methods.getHash(id).call();
                                  const [
                                      name,
                                      ext,
                                  ] = await Promise.all([
                                      contracts.NFT.methods.getMetadata(hash, 'name').call(),
                                      contracts.NFT.methods.getMetadata(hash, 'ext').call(),
                                  ]);


                                  const buffer = await _readStorageHashAsBuffer(hash);
                                  const attachment = new Discord.MessageAttachment(buffer, name + (ext ? '.' + ext : ''));

                                  const m = await message.author.send('<@!' + message.author.id + '>: ' + id + ' is this', attachment);
                                  // m.react('❌');
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: not your nft: ' + id);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: invalid token id: ' + id);
                          }
                      } else if (split[0] === prefix + 'preview' && split.length >= 2 && !isNaN(parseInt(split[1], 10))) {
                          const id = parseInt(split[1], 10);
                          const raw = split[2] === 'raw';

                          const hash = await contracts.NFT.methods.getHash(id).call();
                          const ext = await contracts.NFT.methods.getMetadata(hash, 'ext').call();

                          if (ext) {
                              if (!raw) {
                                  const m = await message.channel.send('<@!' + message.author.id + '>: ' + id + ': https://preview.exokit.org/' + hash + '.' + ext + '/preview.png');
                                  m.react('❌');
                                  m.requester = message.author;
                                  helps.push(m);
                              } else {
                                  const url = `https://ipfs.exokit.org/${hash}/src.${ext}`;
                                  const screenshotUrl = `https://app.webaverse.com/screenshot.html?url=${url}&hash=${hash}&ext=${ext}&type=png`;
                                  const m = await message.channel.send('<@!' + message.author.id + '>: ' + id + ': ' + screenshotUrl);
                              }
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: ' + id + ': cannot preview file type: ' + ext);
                          }
                      } else if (split[0] === prefix + 'gif' && split.length >= 2 && !isNaN(parseInt(split[1], 10))) {
                          const id = parseInt(split[1], 10);

                          const hash = await contracts.NFT.methods.getHash(id).call();
                          const ext = await contracts.NFT.methods.getMetadata(hash, 'ext').call();

                          if (ext) {
                              message.channel.send('<@!' + message.author.id + '>: ' + id + ': https://preview.exokit.org/' + hash + '.' + ext + '/preview.gif');
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: ' + id + ': cannot preview file type: ' + ext);
                          }
                      } else if (split[0] === prefix + 'login') {
                          const id = message.author.id;

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }
                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          const currentName = await contracts.Account.methods.getMetadata(address, 'name').call();

                          if (currentName) {
                              const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                              await ddb.putItem({
                                  TableName: usersTableName,
                                  Item: {
                                      email: { S: id + '.code' },
                                      code: { S: code },
                                  }
                              }).promise();

                              const m = await message.author.send(`Login: https://webaverse.com/login?id=${id}&code=${code}`);
                          } else {
                              const discordName = message.author.username;
                              const result = await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'name', discordName);

                              const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                              await ddb.putItem({
                                  TableName: usersTableName,
                                  Item: {
                                      email: { S: id + '.code' },
                                      code: { S: code },
                                  }
                              }).promise();

                              const m = await message.author.send(`Login: https://webaverse.com/login?id=${id}&code=${code}`);
                          }

                      } else if (split[0] === prefix + 'realm') {
                          const id = message.author.id;
                          let realmId = parseInt(split[1], 10);

                          const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                          await ddb.putItem({
                              TableName: usersTableName,
                              Item: {
                                  email: { S: id + '.code' },
                                  code: { S: code },
                              }
                          }).promise();

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }
                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          const currentName = await contracts.Account.methods.getMetadata(address, 'name').call();

                          if (currentName) {
                              const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                              await ddb.putItem({
                                  TableName: usersTableName,
                                  Item: {
                                      email: { S: id + '.code' },
                                      code: { S: code },
                                  }
                              }).promise();

                              if (isNaN(realmId)) {
                                  message.channel.send('<@!' + message.author.id + '>: must add realm id. (1-5)');
                              } else {
                                  if (realmId >= 1 && realmId <= 5) {
                                      const m = await message.author.send(`Play: https://webaverse.com/login?id=${id}&code=${code}&play=true&realmId=${realmId}`);
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: realm id must be between 1-5.');
                                  }
                              }
                          } else {
                              const discordName = message.author.username;
                              const result = await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'name', discordName);

                              const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                              await ddb.putItem({
                                  TableName: usersTableName,
                                  Item: {
                                      email: { S: id + '.code' },
                                      code: { S: code },
                                  }
                              }).promise();

                              if (isNaN(realmId)) {
                                  message.channel.send('<@!' + message.author.id + '>: must add realm id. (1-5)');
                              } else {
                                  if (realmId >= 1 && realmId <= 5) {
                                      const m = await message.author.send(`Play: https://webaverse.com/login?id=${id}&code=${code}&play=true&realmId=${realmId}`);
                                  } else {
                                      message.channel.send('<@!' + message.author.id + '>: realm id must be between 1-5.');
                                  }
                              }
                          }
                      } else if (split[0] === prefix + 'play') {
                          const id = message.author.id;

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }
                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          const currentName = await contracts.Account.methods.getMetadata(address, 'name').call();

                          if (currentName) {
                              const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                              await ddb.putItem({
                                  TableName: usersTableName,
                                  Item: {
                                      email: { S: id + '.code' },
                                      code: { S: code },
                                  }
                              }).promise();

                              const m = await message.author.send(`Play: https://webaverse.com/login?id=${id}&code=${code}&play=true`);
                          } else {
                              const discordName = message.author.username;
                              const result = await runSidechainTransaction(mnemonic)('Account', 'setMetadata', address, 'name', discordName);

                              const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString(10).slice(-6);
                              await ddb.putItem({
                                  TableName: usersTableName,
                                  Item: {
                                      email: { S: id + '.code' },
                                      code: { S: code },
                                  }
                              }).promise();

                              const m = await message.author.send(`Play: https://webaverse.com/login?id=${id}&code=${code}&play=true`);
                          }
                      } else if (split[0] === prefix + 'key') {
                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();
                          const privateKey = wallet.privateKey.toString('hex');

                          const m = await message.author.send('Address: `' + address + '`\nMnemonic: ||' + mnemonic + '||\nPrivate key: ||' + privateKey + '||');
                          m.react('❌');
                      } else if (split[0] === prefix + 'get' && split.length >= 3 && !isNaN(parseInt(split[1], 10))) {
                          const id = parseInt(split[1], 10);
                          const key = split[2];

                          const hash = await contracts.NFT.methods.getHash(id).call();
                          const value = await contracts.NFT.methods.getMetadata(hash, key).call();

                          message.channel.send('<@!' + message.author.id + '>: ```' + id + '/' + key + ': ' + value + '```');
                      } else if (split[0] === prefix + 'set' && split.length >= 4 && !isNaN(parseInt(split[1], 10))) {
                          const id = parseInt(split[1], 10);
                          const key = split[2];
                          const value = split[3];

                          let { mnemonic } = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }

                          const hash = await contracts.NFT.methods.getHash(id).call();

                          let status, transactionHash;
                          try {
                              const result = await runSidechainTransaction(mnemonic)('NFT', 'setMetadata', hash, key, value);
                              status = result.status;
                              transactionHash = result.transactionHash;
                          } catch (err) {
                              console.warn(err.stack);
                              status = false;
                              transactionHash = '0x0';
                          }

                          if (status) {
                              message.channel.send('<@!' + message.author.id + '>: ```' + id + '/' + key + ' = ' + value + '```');
                          } else {
                              message.channel.send('<@!' + message.author.id + '>: could not set: ' + transactionHash);
                          }
                      } else if (split[0] === prefix + 'gets' && split.length >= 2 && !isNaN(parseInt(split[1], 10))) {
                          const id = parseInt(split[1], 10);
                          const key = unlockableKey;
                          
                          // console.log('got id key', {id, key});
                          
                          let {mnemonic} = await _getUser();
                          if (!mnemonic) {
                              const spec = await _genKey();
                              mnemonic = spec.mnemonic;
                          }
                          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                          const address = wallet.getAddressString();

                          const hash = await contracts.NFT.methods.getHash(id).call();

                          const [
                            isC, // collaborator
                            isO, // owner
                          ] = await Promise.all([
                            (async () => {
                              const isC = await contracts.NFT.methods.isCollaborator(hash, address).call();
                              return isC;
                            })(),
                            (async () => {
                              const owner = await contracts.NFT.methods.ownerOf(id).call();
                              return owner === address;
                            })(),
                          ]);

                          if (isC || isO) {
                            let value = await contracts.NFT.methods.getMetadata(hash, key).call();
                            value = jsonParse(value);
                            if (value !== null) {
                              let {ciphertext, tag} = value;
                              ciphertext = Buffer.from(ciphertext, 'base64');
                              tag = Buffer.from(tag, 'base64');
                              value = decodeSecret(encryptionMnemonic, id, {ciphertext, tag}, 'utf8');
                            }

                            // console.log('get value ok', {key, value});
                            const m = await message.author.send('<@!' + message.author.id + '>: ```' + id + '/' + key + ': ' + value + '```');
                          } else {
                            // console.warn('get error 1');
                            const m = await message.author.send('<@!' + message.author.id + '>: ```you do not have access to ' + id + '```');
                          }
                      } else {
                          if (split[0] === prefix + 'mint') {
                              let quantity = parseInt(split[1], 10);
                              let manualUrl;
                              if (isNaN(quantity)) {
                                  quantity = 1;

                                  if (split[1] && /^https?:\/\//.test(split[1])) {
                                      manualUrl = split[1];
                                  }
                              } else {
                                  manualUrl = split[2];
                              }

                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const files = [];
                              if (manualUrl) {
                                  const match = manualUrl.match(/^http(s)?:\/\//);
                                  if (match) {
                                      const proxyRes = await new Promise((accept, reject) => {
                                          const proxyReq = (match[1] ? https : http).request(manualUrl, proxyRes => {
                                              proxyRes.name = manualUrl.match(/\/([^\/]+?)(?:\?.*)?$/)[1];
                                              if (!/\/..+$/.test(proxyRes.name)) {
                                                  const contentType = proxyRes.headers['content-type'];
                                                  if (contentType) {
                                                      const ext = mime.getExtension(contentType) || 'bin';
                                                      proxyRes.name += '.' + ext;
                                                  }
                                              }
                                              accept(proxyRes);
                                          });
                                          proxyReq.once('error', reject);
                                          proxyReq.end();
                                      });
                                      files.push(proxyRes);
                                  }
                              } else if (message.attachments.size > 0) {
                                  for (const [key, attachment] of message.attachments) {
                                      const { name, url } = attachment;

                                      const proxyRes = await new Promise((accept, reject) => {
                                          const proxyReq = https.request(url, proxyRes => {
                                              proxyRes.name = name;
                                              accept(proxyRes);
                                          });
                                          proxyReq.once('error', reject);
                                          proxyReq.end();
                                      });
                                      files.push(proxyRes);
                                  }
                              }
                              if (files.length > 0) {
                                  await Promise.all(files.map(async file => {
                                      const req = https.request(storageHost, {
                                          method: 'POST',
                                      }, res => {
                                          const bs = [];
                                          res.on('data', d => {
                                              bs.push(d);
                                          });
                                          res.on('end', async () => {
                                              const b = Buffer.concat(bs);
                                              const s = b.toString('utf8');
                                              // console.log('got s', s);
                                              const j = JSON.parse(s);
                                              const { hash } = j;

                                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                              const address = wallet.getAddressString();

                                              const fullAmount = {
                                                  t: 'uint256',
                                                  v: new web3.utils.BN(1e9)
                                                      .mul(new web3.utils.BN(1e9))
                                                      .mul(new web3.utils.BN(1e9)),
                                              };
                                              const fullAmountD2 = {
                                                  t: 'uint256',
                                                  v: fullAmount.v.div(new web3.utils.BN(2)),
                                              };

                                              let status, transactionHash, tokenIds;
                                              try {
                                                  let allowance = await contracts.FT.methods.allowance(address, contracts['NFT']._address).call();
                                                  allowance = new web3.utils.BN(allowance, 10);
                                                  if (allowance.lt(fullAmountD2.v)) {
                                                      const result = await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['NFT']._address, fullAmount.v);
                                                      status = result.status;
                                                  } else {
                                                      status = true;
                                                  }
                                                  if (status) {
                                                      const description = '';
                                                      const extName = path.extname(file.name).slice(1);
                                                      const fileName = extName ? file.name.slice(0, -(extName.length + 1)) : file.name;
                                                      console.log('minting', ['NFT', 'mint', address, hash, fileName, extName, description, quantity]);
                                                      const result = await runSidechainTransaction(mnemonic)('NFT', 'mint', address, hash, fileName, extName, description, quantity);
                                                      status = result.status;
                                                      transactionHash = result.transactionHash;
                                                      const tokenId = new web3.utils.BN(result.logs[0].topics[3].slice(2), 16).toNumber();
                                                      tokenIds = [tokenId, tokenId + quantity - 1];
                                                  }
                                              } catch (err) {
                                                  console.warn(err.stack);
                                                  status = false;
                                                  transactionHash = err.message;
                                                  tokenIds = [];
                                              }

                                              // console.log('minted 1', status);

                                              if (status) {
                                                  message.channel.send('<@!' + message.author.id + '>: minted ' + (tokenIds[0] === tokenIds[1] ? ('https://webaverse.com/assets/' + tokenIds[0]) : tokenIds.map(n => 'https://webaverse.com/assets/' + n).join(' - ')) + ' (' + hash + ')');
                                              } else {
                                                  const balance = await contracts.FT.methods.balanceOf(address).call();
                                                  if (balance < 10) {
                                                      message.channel.send('<@!' + message.author.id + '>: mint transaction failed: you do not have enough SILK. Ask the Webaverse team for some! https://discord.gg/R5wqYhvv53');
                                                  } else {
                                                      message.channel.send('<@!' + message.author.id + '>: mint transaction failed: this item has already been minted.');
                                                  }
                                              }

                                              // console.log('minted 2', status);
                                          });
                                          res.on('error', err => {
                                              console.warn(err.stack);
                                              message.channel.send('<@!' + message.author.id + '>: mint failed: ' + err.message);
                                          });
                                      });
                                      req.on('error', err => {
                                          console.warn(err.stack);
                                          message.channel.send('<@!' + message.author.id + '>: mint failed: ' + err.message);
                                      });
                                      file.pipe(req);
                                  }));
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: no files to mint');
                              }
                          } else if (split[0] === prefix + 'update') {
                              const tokenId = parseInt(split[1], 10);
                              const manualUrl = split[2];

                              let { mnemonic } = await _getUser();
                              if (!mnemonic) {
                                  const spec = await _genKey();
                                  mnemonic = spec.mnemonic;
                              }

                              const files = [];
                              if (manualUrl) {
                                  const match = manualUrl.match(/^http(s)?:\/\//);
                                  if (match) {
                                      const proxyRes = await new Promise((accept, reject) => {
                                          const proxyReq = (match[1] ? https : http).request(manualUrl, proxyRes => {
                                              proxyRes.name = manualUrl.match(/\/([^\/]+?)(?:\?.*)?$/)[1];
                                              if (!/\/..+$/.test(proxyRes.name)) {
                                                  const contentType = proxyRes.headers['content-type'];
                                                  if (contentType) {
                                                      const ext = mime.getExtension(contentType) || 'bin';
                                                      proxyRes.name += '.' + ext;
                                                  }
                                              }
                                              accept(proxyRes);
                                          });
                                          proxyReq.once('error', reject);
                                          proxyReq.end();
                                      });
                                      files.push(proxyRes);
                                  }
                              } else if (message.attachments.size > 0) {
                                  for (const [key, attachment] of message.attachments) {
                                      const { name, url } = attachment;

                                      const proxyRes = await new Promise((accept, reject) => {
                                          const proxyReq = https.request(url, proxyRes => {
                                              proxyRes.name = name;
                                              accept(proxyRes);
                                          });
                                          proxyReq.once('error', reject);
                                          proxyReq.end();
                                      });
                                      files.push(proxyRes);
                                  }
                              }
                              if (files.length > 0) {
                                  const oldHash = await contracts.NFT.methods.getHash(tokenId).call();

                                  await Promise.all(files.map(async file => {
                                      const req = https.request(storageHost, {
                                          method: 'POST',
                                      }, res => {
                                          const bs = [];
                                          res.on('data', d => {
                                              bs.push(d);
                                          });
                                          res.on('end', async () => {
                                              const b = Buffer.concat(bs);
                                              const s = b.toString('utf8');
                                              const j = JSON.parse(s);
                                              const { hash } = j;

                                              const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                                              const address = wallet.getAddressString();

                                              const fullAmount = {
                                                  t: 'uint256',
                                                  v: new web3.utils.BN(1e9)
                                                      .mul(new web3.utils.BN(1e9))
                                                      .mul(new web3.utils.BN(1e9)),
                                              };

                                              let status, transactionHash;
                                              try {
                                                  {
                                                      const result = await runSidechainTransaction(mnemonic)('NFT', 'updateHash', oldHash, hash);
                                                      status = result.status;
                                                      transactionHash = '0x0';
                                                  }
                                                  if (status) {
                                                      const extName = path.extname(file.name).slice(1);
                                                      const fileName = extName ? file.name.slice(0, -(extName.length + 1)) : file.name;
                                                      await Promise.all([
                                                          runSidechainTransaction(mnemonic)('NFT', 'setMetadata', hash, 'name', fileName),
                                                          runSidechainTransaction(mnemonic)('NFT', 'setMetadata', hash, 'ext', extName)
                                                      ]);
                                                      status = true;
                                                      transactionHash = '0x0';
                                                  }
                                              } catch (err) {
                                                  console.warn(err.stack);
                                                  status = false;
                                                  transactionHash = err.message;
                                              }

                                              if (status) {
                                                  message.channel.send('<@!' + message.author.id + '>: updated ' + tokenId + ' to ' + hash);
                                              } else {
                                                  message.channel.send('<@!' + message.author.id + '>: update transaction failed: ' + transactionHash);
                                              }
                                          });
                                          res.on('error', err => {
                                              console.warn(err.stack);
                                              message.channel.send('<@!' + message.author.id + '>: update failed: ' + err.message);
                                          });
                                      });
                                      req.on('error', err => {
                                          console.warn(err.stack);
                                          message.channel.send('<@!' + message.author.id + '>: update failed: ' + err.message);
                                      });
                                      file.pipe(req);
                                  }));
                              } else {
                                  message.channel.send('<@!' + message.author.id + '>: no files to update');
                              }
                          }
                      }
                    }
                } else if (message.channel.type === 'dm') {
                    let { mnemonic } = await _getUser();

                    const s = message.content;
                    const words = _parseWords(s);
                    const split = words.map(word => word[0]);
                    if (split[0] === prefix + 'gets' && split.length >= 2 && !isNaN(parseInt(split[1], 10))) {
                        const id = parseInt(split[1], 10);
                        const key = unlockableKey;
                        
                        // console.log('got id key', {id, key});
                        
                        let {mnemonic} = await _getUser();
                        if (!mnemonic) {
                            const spec = await _genKey();
                            mnemonic = spec.mnemonic;
                        }
                        const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                        const address = wallet.getAddressString();

                        const hash = await contracts.NFT.methods.getHash(id).call();

                        const [
                          isC, // collaborator
                          isO, // owner
                        ] = await Promise.all([
                          (async () => {
                            const isC = await contracts.NFT.methods.isCollaborator(hash, address).call();
                            return isC;
                          })(),
                          (async () => {
                            const owner = await contracts.NFT.methods.ownerOf(id).call();
                            return owner === address;
                          })(),
                        ]);

                        if (isC || isO) {
                          let value = await contracts.NFT.methods.getMetadata(hash, key).call();
                          value = jsonParse(value);
                          if (value !== null) {
                            let {ciphertext, tag} = value;
                            ciphertext = Buffer.from(ciphertext, 'base64');
                            tag = Buffer.from(tag, 'base64');
                            value = decodeSecret(encryptionMnemonic, id, {ciphertext, tag}, 'utf8');
                          }

                          // console.log('get value ok', {key, value});
                          const m = await message.author.send('<@!' + message.author.id + '>: ```' + id + '/' + key + ': ' + value + '```');
                        } else {
                          // console.warn('get error 1');
                          const m = await message.author.send('<@!' + message.author.id + '>: ```you do not have access to ' + id + '```');
                        }
                    } else if (split[0] === prefix + 'sets' && split.length >= 3 && !isNaN(parseInt(split[1], 10))) {
                        const id = parseInt(split[1], 10);
                        const key = unlockableKey;
                        let value = s.slice(words[2].index);
                        
                        // console.log('do set', id, key, value);

                        let {mnemonic} = await _getUser();
                        if (!mnemonic) {
                            const spec = await _genKey();
                            mnemonic = spec.mnemonic;
                        }
                        const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
                        const address = wallet.getAddressString();

                        const hash = await contracts.NFT.methods.getHash(id).call();
                        const isC = await contracts.NFT.methods.isCollaborator(hash, address).call();

                        if (isC) {
                          let {ciphertext, tag} = encodeSecret(encryptionMnemonic, id, value, 'utf8');
                          ciphertext = ciphertext.toString('base64');
                          tag = tag.toString('base64');
                          value = JSON.stringify({
                            ciphertext,
                            tag,
                          });

                          let status, transactionHash;
                          try {
                              const result = await runSidechainTransaction(mnemonic)('NFT', 'setMetadata', hash, key, value);
                              status = result.status;
                              transactionHash = result.transactionHash;
                          } catch (err) {
                              console.warn(err.stack);
                              status = false;
                              transactionHash = '0x0';
                          }

                          if (status) {
                              const m = await message.author.send('<@!' + message.author.id + '>: ```' + id + '/' + key + ' = ' + value + '```');
                              // console.log('set value ok', {key, value});
                          } else {
                              // console.warn('set error 1');
                              const m = await message.author.send('<@!' + message.author.id + '>: could not set: ' + transactionHash);
                          }
                        } else {
                          // console.warn('set error 2');
                          const m = await message.author.send('<@!' + message.author.id + '>: ```you do not have access to ' + id + '```');
                        }
                    } else if (split[0] === prefix + 'key') {
                        if (split.length === 1 + 12) {
                            const mnemonic = split.slice(1).join(' ');
                            if (bip39.validateMnemonic(mnemonic)) {
                                await ddb.putItem({
                                    TableName: usersTableName,
                                    Item: {
                                        email: { S: message.author.id + '.discordtoken' },
                                        mnemonic: { S: mnemonic },
                                    }
                                }).promise();
                                message.author.send('set key to ```' + JSON.stringify(mnemonic) + '```');
                            } else {
                                message.author.send('invalid key');
                            }
                        } else {
                            if (!mnemonic || split[1] === 'reset') {
                                const spec = await _genKey();
                                mnemonic = spec.mnemonic;
                            }

                            message.author.send('Key: ```' + mnemonic + '```');
                        }
                    }
                }
            }
        });
    });

    client.login(discordApiToken);
}
