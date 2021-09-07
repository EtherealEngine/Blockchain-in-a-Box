const find = require('find-up');
const findEnv = () => find.sync(process.env.ENV_FILE || '.env');

require("dotenv").config({ path: findEnv() });

/* eslint-disable no-undef */
const Identity = artifacts.require("Identity");
const CurrencyContract = artifacts.require("Currency");
const CurrencyProxyContract = artifacts.require("CurrencyProxy");
const Inventory = artifacts.require("Inventory");
const InventoryProxy = artifacts.require("InventoryProxy");
const Trade = artifacts.require("Trade");

const chainId = require("../config/chainIds.js");

console.log("MAINNET ADDRESS IS", process.env.mainnetTreasuryAddress)

// Currency
const CURRENCY_CONTRACT_NAME = "Currency";
const CURRENCY_CONTRACT_SYMBOL = process.env.CURRENCY_CONTRACT_SYMBOL || "COIN";
const CURRENCY_MARKET_CAP = process.env.CURRENCY_MARKET_CAP || 116340000;

// ASSETS
const assetContractName = "Inventory";
const assetContractSymbol = process.env.ASSET_CONTRACT_SYMBOL || "ASSET";
const assetsAreMintable = process.env.ASSETS_ARE_MINTABLE || true;
const assetBaseUri = process.env.ASSET_BASE_URI || "";
const mintFee = process.env.MINTING_FEE || 1;

const NetworkTypes = {
  mainnet: "mainnet",
  mainnetsidechain: "mainnetsidechain",
  polygon: "polygon",
  testnet: "testnet",
  testnetsidechain: "testnetsidechain",
  testnetpolygon: "testnetpolygon",
  development: "development",
};

const treasurer = {
  "mainnet": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "mainnetsidechain": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "polygon": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "testnet": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "testnetsidechain": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "testnetpolygon": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "development": "0xf90c251e42367a6387afecba10b95c97eaf3b287"
}

const signer = {
  "mainnet": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "mainnetsidechain": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "polygon": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "testnet": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "testnetsidechain": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "testnetpolygon": "0xf90c251e42367a6387afecba10b95c97eaf3b287",
  "development": "0xf90c251e42367a6387afecba10b95c97eaf3b287"
}

module.exports = async function (deployer) {
  const networkType = NetworkTypes[process.argv[4]];
  console.log(networkType);
  if (!networkType)
    return console.error(
      process.argv[4] + " was not found in the networkType list"
    );
  
  console.log("Signer is", signer[networkType]);

  if (!signer[networkType]) return console.error("Signer address not valid");

  console.log("Treasury is", treasurer[networkType]);

  if (!treasurer[networkType])
    return console.error("Treasury address not valid");

  console.log("Deploying on the " + networkType + " networkType");
  await deployer.deploy(Identity);
  let identity = await Identity.deployed();
  console.log("Identity address is " + identity.address);

  await deployer.deploy(CurrencyContract, CURRENCY_CONTRACT_NAME, CURRENCY_CONTRACT_SYMBOL, CURRENCY_MARKET_CAP);
  let coin = await CurrencyContract.deployed();
  const coinAddress = coin.address;

  console.log("Currency contract address is " + coinAddress);
  console.log("CURRENCY_CONTRACT_NAME is " + CURRENCY_CONTRACT_NAME);

  console.log("chainId[networkType] " + chainId[networkType]);
  console.log("chainId[networkType][CURRENCY_CONTRACT_NAME] " + chainId[networkType][CURRENCY_CONTRACT_NAME]);


  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(
    CurrencyProxyContract,
    coinAddress,
    signer[networkType],
    chainId[networkType][CURRENCY_CONTRACT_NAME]
  );
  let coinProxy = await CurrencyProxyContract.deployed();
  const coinProxyAddress = coinProxy.address;

  console.log("Currency proxy contract address is " + coinProxyAddress);

  console.log("Attempting to deploy Inventory contract with these variables");
  console.log(
    assetContractName,
    assetContractSymbol,
    assetBaseUri,
    coinAddress,
    mintFee,
    treasurer[networkType],
    assetsAreMintable
  );
  /** name, symbol, baseUri, _erc20Contract, _mintFee, _treasuryAddress, _isPublicallyMintable */
  await deployer.deploy(
    Inventory,
    assetContractName,
    assetContractSymbol,
    assetBaseUri,
    coinAddress,
    mintFee,
    treasurer[networkType],
    assetsAreMintable
  );

  let asset = await Inventory.deployed();
  const assetAddress = asset.address;

  console.log("Inventory address is " + assetAddress);

  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(
    InventoryProxy,
    assetAddress,
    signer[networkType],
    chainId[networkType][assetContractName]
  );
  let erc721Proxy = await InventoryProxy.deployed();

  const assetProxyAddress = erc721Proxy.address;

  console.log("InventoryProxy address is " + assetProxyAddress);

  /** parentERC20Address, parentERC721Address, signerAddress */
  await deployer.deploy(
    Trade,
    coinAddress,
    assetAddress,
    signer[networkType]
  );
  let trade = await Trade.deployed();
  console.log("Trade address is " + trade.address);

  console.log("*******************************");
  console.log("Signer: ", signer[networkType]);
  console.log("Treasury: ", treasurer[networkType]);
  console.log("Deploying on the " + networkType + " networkType");
  console.log("*******************************");
  console.log('"' + networkType + '": {');
  console.log(' "Identity": ' + '"' + identity.address + '",');
  console.log(' "Currency": ' + '"' + coinAddress + '",');
  console.log(' "CurrencyProxy": ' + '"' + coinProxyAddress + '",');
  console.log(' "Inventory": ' + '"' + assetAddress + '",');
  console.log(' "InventoryProxy": ' + '"' + assetProxyAddress + '",');
  console.log("}");
  console.log("*******************************");
};
