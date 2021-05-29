let config = require('fs').existsSync(__dirname + '/config.json') ? require('./config.json') : require('./config.default.json');

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || config.AWS_ACCESS_KEY_ID || config.accessKeyId;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || config.AWS_SECRET_ACCESS_KEY || config.secretAccessKey;
const AWS_REGION = process.env.AWS_REGION || config.AWS_REGION || config.awsRegion || 'us-west-1';

const MAINNET_MNEMONIC = process.env.MAINNET_MNEMONIC || config.MAINNET_MNEMONIC || config.mainnetMnemonic;
const TESTNET_MNEMONIC = process.env.TESTNET_MNEMONIC || config.TESTNET_MNEMONIC  || config.testnetMnemonic;
const POLYGON_MNEMONIC = process.env.POLYGON_MNEMONIC || config.POLYGON_MNEMONIC  || config.polygonMnemonic;
const TESTNET_POLYGON_MNEMONIC = process.env.TESTNET_POLYGON_MNEMONIC || config.TESTNET_POLYGON_MNEMONIC  || config.testnetpolygonMnemonic;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || config.INFURA_PROJECT_ID || config.infuraProjectId;
const ENCRYPTION_MNEMONIC = process.env.ENCRYPTION_MNEMONIC || config.ENCRYPTION_MNEMONIC   || config.encryptionMnemonic;
const POLYGON_VIGIL_KEY = process.env.POLYGON_VIGIL_KEY || config.POLYGON_VIGIL_KEY  || config.polygonVigilKey || `1bdde9289621d9d420488a9804254f4a958e128b`;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || config.GITHUB_CLIENT_ID || config.githubClientId;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || config.GITHUB_CLIENT_SECRET  || config.githubClientSecret;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || config.DISCORD_CLIENT_ID  || config.discordClientId;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || config.DISCORD_CLIENT_SECRET  || config.discordClientSecret;

const REDIS_HOST = process.env.REDIS_HOST || config.REDIS_HOST || config.redisHost;
const REDIS_PORT = process.env.REDIS_PORT || config.REDIS_PORT|| config.redisPort || 6369;
const REDIS_KEY = process.env.REDIS_KEY || config.REDIS_KEY || config.redisKey || "default";

const HTTP_PORT = parseInt(process.env.HTTP_PORT || config.HTTP_PORT, 10) || 80;
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || config.HTTPS_PORT, 10) || 443;
const PUBLIC_IP_ADDRESS = process.env.PUBLIC_IP_ADDRESS || config.PUBLIC_IP_ADDRESS || config.publicIp;
const PRIVATE_IP_ADDRESS = process.env.PRIVATE_IP_ADDRESS || config.PRIVATE_IP_ADDRESS || config.privateIp;
const IPFS_HOST = process.env.IPFS_HOST || config.IPFS_HOST || config.STORAGE_HOST || 'https://ipfs.exokit.org';
const CACHE_HOST_URL = process.env.CACHE_HOST_URL || config.CACHE_HOST_URL || config.cacheHostUrl || 'cache.webaverse.com';
const STORAGE_HOST = process.env.STORAGE_HOST || config.STORAGE_HOST || config.storageHost || 'https://storage.exokit.org';

const ETHEREUM_HOST = process.env.ETHEREUM_HOST || config.ETHEREUM_HOST || config.ethereumHost || config.ethereumHostAddress || 'ethereum.exokit.org';
const DEFAULT_TOKEN_DESCRIPTION = process.env.DEFAULT_TOKEN_DESCRIPTION || config.DEFAULT_TOKEN_DESCRIPTION || "";
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || config.AUTH_TOKEN_SECRET || "";
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY || config.AUTH_SECRET_KEY || "";
const IPFS_HOST_PORT = process.env.IPFS_HOST_PORT || config.IPFS_HOST_PORT || 8081;

const MINTING_FEE = process.env.MINTING_FEE || config.MINTING_FEE || config.mintingFee || 10;

module.exports = {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  STORAGE_HOST,
  IPFS_HOST,
  IPFS_HOST_PORT,
  CACHE_HOST_URL,
  AUTH_SECRET_KEY,
  AUTH_TOKEN_SECRET,
  PUBLIC_IP_ADDRESS,
  PRIVATE_IP_ADDRESS,
  HTTP_PORT,
  HTTPS_PORT,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_KEY,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  MAINNET_MNEMONIC,
  TESTNET_MNEMONIC,
  POLYGON_MNEMONIC,
  TESTNET_POLYGON_MNEMONIC,
  INFURA_PROJECT_ID,
  ENCRYPTION_MNEMONIC,
  POLYGON_VIGIL_KEY,
  DEFAULT_TOKEN_DESCRIPTION,
  MINTING_FEE,
  ETHEREUM_HOST,
  config
};