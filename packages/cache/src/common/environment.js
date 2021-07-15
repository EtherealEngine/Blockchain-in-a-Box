const dotenv = require("dotenv");

dotenv.config({
  path: `./../../.env`,
});

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const POLYGON_VIGIL_KEY = process.env.POLYGON_VIGIL_KEY;
const MAINNET_MNEMONIC = process.env.MAINNET_MNEMONIC;
const MINTING_FEE = process.env.MINTING_FEE;
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const HTTP_PORT = process.env.HTTP_PORT;
const HTTPS_PORT = process.env.HTTPS_PORT;

const ETHEREUM_HOST = process.env.ETHEREUM_HOST;

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_KEY = process.env.REDIS_KEY;

const DEVELOPMENT = !process.env.PRODUCTION;
const PRODUCTION = process != undefined && process.env.PRODUCTION;

if (!REDIS_KEY)
  console.warn(
    "Environment vars not set successfully, do you have env vars set up?"
  );

module.exports = {
  INFURA_PROJECT_ID,
  INFURA_API_KEY,
  POLYGON_VIGIL_KEY,
  MAINNET_MNEMONIC,
  MINTING_FEE,
  AUTH_TOKEN_SECRET,
  AUTH_SECRET_KEY,
  HTTP_PORT,
  HTTPS_PORT,
  ETHEREUM_HOST,
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_KEY,
  DEVELOPMENT,
  PRODUCTION,
};
