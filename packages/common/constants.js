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
  'addressProofs',
];

const ids = {
  lastCachedBlockAccount: 'lastCachedBlock',
  lastCachedBlockNft: -1,
};

const tableNames = {
  user: 'users',
  defaultCacheTable: 'sidechain-cache',
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
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const codeTestRegex = /^[0-9]{6}$/;
const discordIdTestRegex = /^[0-9]+$/;
const twitterIdTestRegex = /^@?(\w){1,15}$/;

const zeroAddress = '0x0000000000000000000000000000000000000000';
const burnAddress = "0x000000000000000000000000000000000000dEaD";

const proofOfAddressMessage = `Proof of address.`;
const unlockableMetadataKey = 'unlockable';
const encryptedMetadataKey = 'encrypted';

const maxFileSize = 50 * 1024 * 1024;

const defaultAvatarPreview = "https://preview.exokit.org/[https://raw.githubusercontent.com/avaer/vrm-samples/master/vroid/male.vrm]/preview.png";

module.exports = {
  maxFileSize,
  burnAddress,
  defaultAvatarPreview,
  unlockableMetadataKey,
  encryptedMetadataKey,
  proofOfAddressMessage,
  accountKeys,
  ids,
  tableNames,
  redisPrefixes,
  nftIndexName,
  mainnetSignatureMessage,
  emailRegex,
  codeTestRegex,
  discordIdTestRegex,
  twitterIdTestRegex,
  zeroAddress
};