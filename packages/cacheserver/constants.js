const accountKeys = [
  'name',
  'avatarId',
  'avatarName',
  'avatarExt',
  'avatarPreview',
  'loadout',
  'homeSpaceId',
  'homeSpaceName',
  'homeSpaceExt',
  'homeSpacePreview',
  'ftu',
  // 'mainnetAddress',
  'addressProofs',
];
const nftKeys = [
  'name',
  'description',
  'ext',
  'image',
  'unlockable',
  'encrypted',
];
const nftPropertiesKeys = [
  'name',
  'description',
  'ext',
  'image',
  'unlockable',
  'encrypted',
];
const ids = {
  lastCachedBlockAccount: 'lastCachedBlock',
  lastCachedBlockNft: -1,
};
const tableNames = {
  mainnetAccount: 'mainnet-cache-account',
  mainnetNft: 'mainnet-cache-nft',
  mainnetsidechainAccount: 'sidechain-cache-account',
  mainnetsidechainNft: 'sidechain-cache-nft',
  testnetAccount: 'testnet-cache-account',
  testnetNft: 'testnet-cache-nft',
  testnetsidechainAccount: 'testnetsidechain-cache-account',
  testnetsidechainNft: 'testnetsidechain-cache-nft',
  polygonAccount: 'polygon-cache-account',
  polygonNft: 'polygon-cache-nft',
  testnetpolygonAccount: 'testnetpolygon-cache-account',
  testnetpolygonNft: 'testnetpolygon-cache-nft',
};
const redisPrefixes = (() => {
  const result = {};
  for (const k in tableNames) {
    result[k] = tableNames[k].replace(/\-/g, '');
  }
  return result;
})();
const nftIndexName = 'nftIdx';
const mainnetSignatureMessage = `Connecting mainnet address.`;

module.exports = {
  accountKeys,
  nftKeys,
  nftPropertiesKeys,
  ids,
  tableNames,
  redisPrefixes,
  nftIndexName,
  mainnetSignatureMessage,
};