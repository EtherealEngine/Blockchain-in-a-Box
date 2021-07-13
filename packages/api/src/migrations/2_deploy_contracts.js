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
const CurrencyContractName = "Currency";
const CoinContractSymbol = process.env.CoinContractSymbol || "COIN";
const CoinMarketCap = process.env.CoinMarketCap || 116340000;

// ASSETS
const assetContractName = "Inventory";
const assetContractSymbol = process.env.ASSET_CONTRACT_SYMBOL || "ASSET";
const assetsAreMintable = process.env.ASSETS_ARE_MINTABLE || true;
const assetBaseUri = process.env.ASSET_BASE_URI || "";
const mintFee = process.env.MINTING_FEE || 10;

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
  mainnet: process.env.mainnetTreasuryAddress,
  mainnetsidechain: process.env.mainnetsidechainTreasuryAddress,
  polygon: process.env.polygonTreasuryAddress,
  testnet: process.env.testnetTreasuryAddress,
  testnetsidechain: process.env.testnetsidechainTreasuryAddress,
  testnetpolygon: process.env.testnetpolygonTreasuryAddress,
  development: process.env.developmentTreasuryAddress,
};

const signer = {
  mainnet: process.env.mainnetSignerAddress,
  mainnetsidechain: process.env.mainnetsidechainSignerAddress,
  polygon: process.env.polygonSignerAddress,
  testnet: process.env.testnetSignerAddress,
  testnetsidechain: process.env.testnetsidechainSignerAddress,
  testnetpolygon: process.env.testnetpolygonSignerAddress,
  development: process.env.developmentSignerAddress,
};

module.exports = async function (deployer) {
  const networkType = NetworkTypes[process.argv[4]];

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

  await deployer.deploy(CurrencyContract, CurrencyContractName, CoinContractSymbol, CoinMarketCap);
  let coin = await CurrencyContract.deployed();
  const coinAddress = coin.address;

  console.log("Currency contract address is " + coinAddress);
  console.log("CurrencyContractName is " + CurrencyContractName);

  console.log("chainId[networkType] " + chainId[networkType]);
  console.log("chainId[networkType][CurrencyContractName] " + chainId[networkType][CurrencyContractName]);


  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(
    CurrencyProxyContract,
    coinAddress,
    signer[networkType],
    chainId[networkType][CurrencyContractName]
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
