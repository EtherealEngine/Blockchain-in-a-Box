const identityKeys = [
  "name"
];

const ids = {
  lastCachedBlockAccount: "lastCachedBlock",
  lastCachedBlockAsset: -1,
};

const tableNames = {
  user: "users",
  defaultCacheTable: "sidechain-cache",
  mainnetIdentity: "mainnet-cache-identity",
  mainnetAsset: "mainnet-cache-asset",
  mainnetSidechainIdentity: "sidechain-cache-identity",
  mainnetSidechainAsset: "sidechain-cache-asset",
  testnetAccount: "testnet-cache-identity",
  testnetAsset: "testnet-cache-asset",
  testnetSidechainIdentity: "testnetsidechain-cache-identity",
  testnetSidechainAsset: "testnetsidechain-cache-asset",
  polygonIdentity: "polygon-cache-identity",
  polygonAsset: "polygon-cache-asset",
  testnetPolygonIdentity: "testnetpolygon-cache-identity",
  testnetpolygonAsset: "testnetpolygon-cache-asset",
};

const redisPrefixes = (() => {
  const result = {};
  for (const k in tableNames) {
    result[k] = tableNames[k].replace(/\-/g, "");
  }
  return result;
})();

const assetIndexName = "assetIndex";
const mainnetSignatureMessage = `Connecting mainnet address.`;
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const codeTestRegex = /^[0-9]{6}$/;
const discordIdTestRegex = /^[0-9]+$/;
const twitterIdTestRegex = /^@?(\w){1,15}$/;

const zeroAddress = "0x0000000000000000000000000000000000000000";
const burnAddress = "0x000000000000000000000000000000000000dEaD";

const proofOfAddressMessage = `Proof of address.`;

const maxFileSize = 50 * 1024 * 1024;
module.exports = {
  maxFileSize,
  burnAddress,
  proofOfAddressMessage,
  identityKeys,
  ids,
  tableNames,
  redisPrefixes,
  assetIndexName,
  mainnetSignatureMessage,
  emailRegex,
  codeTestRegex,
  discordIdTestRegex,
  twitterIdTestRegex,
  zeroAddress,
  usersTableName: "users",
  prefix: ".",
  previewExt: "png",
  treasurerRoleName: "Treasurer",
};
