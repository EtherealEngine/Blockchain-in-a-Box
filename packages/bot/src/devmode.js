// TODO: Remove me

const { accessKeyId, secretAccessKey, tradeMnemonic, treasuryMnemonic, discordApiToken } = 
require('fs').existsSync('./config.json') ? require('./config.json') : {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    tradeMnemonic: process.env.tradeMnemonic,
    treasuryMnemonic: process.env.treasuryMnemonic,
    discordApiToken: process.env.discordApiToken
  }

exports.devMode = accessKeyId === undefined ||
    secretAccessKey === undefined ||
    // tradeMnemonic === undefined ||
    // treasuryMnemonic === undefined ||
    accessKeyId === null ||
    secretAccessKey === null ||
    // tradeMnemonic === null ||
    // treasuryMnemonic === null ||
    accessKeyId === "" ||
    secretAccessKey === "" ||
    discordApiToken === "";
    // tradeMnemonic === "" ||
    // treasuryMnemonic === "";
