// TODO: Remove me. IF REMOVING THIS FILE: Also remove the env variables used in this file.

rts.devMode = 
    process.env.accessKeyId === undefined ||
    process.env.secretAccessKey === undefined ||
    // tradeMnemonic === undefined ||
    // treasuryMnemonic === undefined ||
    process.env.accessKeyId === null ||
    process.env.secretAccessKey === null ||
    // tradeMnemonic === null ||
    // treasuryMnemonic === null ||
    process.env.accessKeyId === "" ||
    process.env.secretAccessKey === "" ||
    process.env.discordApiToken === "";
    // tradeMnemonic === "" ||
    // treasuryMnemonic === "";
