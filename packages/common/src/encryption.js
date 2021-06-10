const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const { createCipheriv, createDecipheriv } = require("crypto");

const encodeSecret = (mnemonic, id, secret, encoding) => {
  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const privateKey = wallet.privateKey;

  const key = privateKey.slice(0, 24);

  const nonce = Buffer.alloc(12);
  const dataView = new DataView(nonce.buffer);
  dataView.setUint32(0, id);
  const cipher = createCipheriv("aes-192-ccm", key, nonce, {
    authTagLength: 16,
  });

  const ciphertext = cipher.update(secret, encoding);
  cipher.final();

  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    tag,
  };
};
const decodeSecret = (mnemonic, id, { ciphertext, tag }, encoding) => {
  const wallet = hdkey
    .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  const privateKey = wallet.privateKey;
  const key = privateKey.slice(0, 24);

  const nonce = Buffer.alloc(12);
  const dataView = new DataView(nonce.buffer);
  dataView.setUint32(0, id);

  const decipher = createDecipheriv("aes-192-ccm", key, nonce, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);

  const receivedPlaintext = decipher.update(ciphertext, null, encoding);

  return receivedPlaintext;
};

module.exports = {
  encodeSecret,
  decodeSecret,
};
