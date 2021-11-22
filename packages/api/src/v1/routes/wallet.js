const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const { setCorsHeaders } = require("../../common/utils.js");
const { ResponseStatus } = require("../enums.js");
const {
  DEVELOPMENT
} = require("../../common/environment.js");
const { default: Web3 } = require("web3");
const {
  getBlockchain,
  runSidechainTransaction,
  runSidechainWalletTransaction
} = require("../../common/blockchain.js");

// Generates a new mnemonic, private key and public address and hands the mnemonic back
async function createWallet(req, res) {
  if (DEVELOPMENT) setCorsHeaders(res);
  // try {
    const userMnemonic = bip39.generateMnemonic();
    console.log("Responding with mnemonic")
    console.log(userMnemonic);
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(userMnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const userAddress = wallet.getAddressString();
    const privateKey = wallet.getPrivateKeyString();

    return res.json({
      status: ResponseStatus.Success,
      userMnemonic,
      userAddress,
      privateKey,
      error: null,
    });
  // } catch (error) {
  //   return res.json({
  //     status: ResponseStatus.Error,
  //     userMnemonic: null,
  //     userAddress: null,
  //     error,
  //   });
  // }
}

async function sendTransactionAsset(req, res) {
  try {
    const { mnemonic, fromUserAddress, toUserAddress, amount } = req.body;
    let status = true;
    let error = null;

    
      try {
        const result = await runSidechainWalletTransaction(mnemonic)(
          toUserAddress,
          amount
        );

        status = status && result.status;
      } catch (err) {
        console.warn(err.stack);
        status = false;
        error = err;
      }

    if (status) {
      return res.json({
        status: ResponseStatus.Success,
        message: "Transferred to " + toUserAddress,
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

module.exports = {
  createWallet,
  sendTransactionAsset
};
