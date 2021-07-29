const find = require('find-up');
const { Sequelize, Model, DataTypes } = require("sequelize");

console.log("in deploy contract");
const sequelize = new Sequelize('dev', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
});
const { QueryTypes } = require('sequelize');

/* eslint-disable no-undef */
const Identity = artifacts.require("Identity");
const CurrencyContract = artifacts.require("Currency");
const CurrencyProxyContract = artifacts.require("CurrencyProxy");
const Inventory = artifacts.require("Inventory");
const InventoryProxy = artifacts.require("InventoryProxy");
const Trade = artifacts.require("Trade");

const chainId = require("../config/chainIds.js");


const NetworkTypes = {
  mainnet: "mainnet",
  mainnetsidechain: "mainnetsidechain",
  polygon: "polygon",
  testnet: "testnet",
  testnetsidechain: "testnetsidechain",
  testnetpolygon: "testnetpolygon",
  development: "development",
};

module.exports = async function (deployer) {
  //set network type from run argument.like truffle migrate --reset development
  const networkType = NetworkTypes[process.argv[4]];
  if (!networkType)
    return console.error(
      process.argv[4] + " was not found in the networkType list"
    );
  //check for already deployed
  const asyncCheck = async(networkType) => {
    let data;
    try {
      data = await sequelize.query('SELECT count(1) cnt FROM `ADDRESS_DATA` WHERE NETWORK_TYPE=?', {type: sequelize.QueryTypes.SELECT,replacements: [networkType]});
    } catch (err) {
      console.log(err);
    }
    return data;
  };
  var checkData = await asyncCheck(networkType);
  checkData=JSON.stringify(checkData);
  if (parseInt(checkData.substring(8,9)) >0)
    return console.error("Contract already deployed for",networkType,"network");

  //setup environment variable from DB
  const asyncGlobal = async() => {
    let data;
    try {
      data = await sequelize.query('SELECT DATA_KEY,DATA_VALUE FROM `ENVIRONMENT_DATA`', {type: sequelize.QueryTypes.SELECT});
    } catch (err) {
      console.log(err);
    }
    return data;
  };
  const globalData = await asyncGlobal();
  let DEVELOPMENT_SIGNER_ADDRESS;
  let DEVELOPMENT_TREASURY_ADDRESS;
  let MAINNET_SIGNER_ADDRESS;
  let MAINNET_TREASURY_ADDRESS;
  let MAINNET_SIDECHAIN_SIGNER_ADDRESS;
  let MAINNET_SIDECHAIN_TREASURY_ADDRESS;
  let POLYGON_SIGNER_ADDRESS;
  let POLYGON_TREASURY_ADDRESS;
  let TESTNET_POLYGON_SIGNER_ADDRESS;
  let TESTNET_POLYGON_TREASURY_ADDRESS;
  let TESTNET_SIGNER_ADDRESS;
  let TESTNET_TREASURY_ADDRESS;
  let TESTNET_SIDECHAIN_SIGNER_ADDRESS;
  let TESTNET_SIDECHAIN_TREASURY_ADDRESS;
  let COIN_CONTRACT_SYMBOL;
  let CURRENCY_MARKET_CAP;
  let ASSET_CONTRACT_SYMBOL;
  let ASSETS_ARE_MINTABLE;
  let ASSET_BASE_URI;
  let MINTING_FEE;
  for(let i of globalData){
    if (i.DATA_KEY=="DEVELOPMENT_SIGNER_ADDRESS")
      DEVELOPMENT_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="DEVELOPMENT_TREASURY_ADDRESS")
      DEVELOPMENT_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="MAINNET_SIGNER_ADDRESS")
      MAINNET_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="MAINNET_TREASURY_ADDRESS")
      MAINNET_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="MAINNET_SIDECHAIN_SIGNER_ADDRESS")
      MAINNET_SIDECHAIN_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="MAINNET_SIDECHAIN_TREASURY_ADDRESS")
      MAINNET_SIDECHAIN_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="POLYGON_SIGNER_ADDRESS")
      POLYGON_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="POLYGON_TREASURY_ADDRESS")
      POLYGON_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="TESTNET_POLYGON_SIGNER_ADDRESS")
      TESTNET_POLYGON_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="TESTNET_POLYGON_TREASURY_ADDRESS")
      TESTNET_POLYGON_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="TESTNET_SIGNER_ADDRESS")
      TESTNET_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="TESTNET_TREASURY_ADDRESS")
      TESTNET_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="TESTNET_SIDECHAIN_SIGNER_ADDRESS")
      TESTNET_SIDECHAIN_SIGNER_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="TESTNET_SIDECHAIN_TREASURY_ADDRESS")
      TESTNET_SIDECHAIN_TREASURY_ADDRESS= i.DATA_VALUE;
    if (i.DATA_KEY=="COIN_CONTRACT_SYMBOL")
      COIN_CONTRACT_SYMBOL= i.DATA_VALUE;
    if (i.DATA_KEY=="CURRENCY_MARKET_CAP")
      CURRENCY_MARKET_CAP= i.DATA_VALUE;
    if (i.DATA_KEY=="ASSET_CONTRACT_SYMBOL")
      ASSET_CONTRACT_SYMBOL= i.DATA_VALUE;
    if (i.DATA_KEY=="ASSETS_ARE_MINTABLE")
      ASSETS_ARE_MINTABLE= i.DATA_VALUE;
    if (i.DATA_KEY=="ASSET_BASE_URI")
      ASSET_BASE_URI= i.DATA_VALUE;
    if (i.DATA_KEY=="MINTING_FEE")
      MINTING_FEE= i.DATA_VALUE;
  }

  // Currency
  const CurrencyContractName = "Currency";
  const CurrencyContractSymbol = COIN_CONTRACT_SYMBOL || "COIN";
  const CurrencyMarketCap = CURRENCY_MARKET_CAP || 116340000;

  // ASSETS
  const assetContractName = "Inventory";
  const assetContractSymbol = ASSET_CONTRACT_SYMBOL || "ASSET";
  const assetsAreMintable = ASSETS_ARE_MINTABLE || true;
  const assetBaseUri = ASSET_BASE_URI || "";
  const mintFee = MINTING_FEE || 10;
  //Treasurer address for different network
  const treasurer = {
    mainnet: MAINNET_TREASURY_ADDRESS,
    mainnetsidechain: MAINNET_SIDECHAIN_TREASURY_ADDRESS,
    polygon: POLYGON_TREASURY_ADDRESS,
    testnet: TESTNET_TREASURY_ADDRESS,
    testnetsidechain: TESTNET_SIDECHAIN_SIGNER_ADDRESS,
    testnetpolygon: TESTNET_POLYGON_TREASURY_ADDRESS,
    development: DEVELOPMENT_TREASURY_ADDRESS,
  };
  //Signer address for different network
  const signer = {
    mainnet: MAINNET_SIGNER_ADDRESS,
    mainnetsidechain: MAINNET_SIDECHAIN_SIGNER_ADDRESS,
    polygon: POLYGON_SIGNER_ADDRESS,
    testnet: TESTNET_SIGNER_ADDRESS,
    testnetsidechain: TESTNET_SIDECHAIN_SIGNER_ADDRESS,
    testnetpolygon: TESTNET_POLYGON_SIGNER_ADDRESS,
    development: DEVELOPMENT_SIGNER_ADDRESS,
  };

  

  console.log("Signer is", signer[networkType]);

  if (!signer[networkType]) return console.error("Signer address not valid");

  console.log("Treasury is", treasurer[networkType]);

  if (!treasurer[networkType])
    return console.error("Treasury address not valid");

  console.log("Deploying on the " + networkType + " networkType");
  
  //deploy Identity contract
  await deployer.deploy(Identity);
  let identity = await Identity.deployed();
  console.log("Identity address is " + identity.address);
  const identityAddress = identity.address;

  //deploy Currency contract
  await deployer.deploy(CurrencyContract, CurrencyContractName, CurrencyContractSymbol, CurrencyMarketCap);
  let coin = await CurrencyContract.deployed();
  const coinAddress = coin.address;

  console.log("Currency contract address is " + coinAddress);
  console.log("CURRENCY_CONTRACT_NAME is " + CurrencyContractName);

  console.log("chainId[networkType] " + chainId[networkType]);
  console.log("chainId[networkType][CURRENCY_CONTRACT_NAME] " + chainId[networkType][CurrencyContractName]);
  

  /** parentAddress, signerAddress, _chainId */
  //deploy Currency Proxy contract
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
  //deploy Inventory contract
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
  //deploy Inventory Proxy contract
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
  //deploy Trade contract
  await deployer.deploy(
    Trade,
    coinAddress,
    assetAddress,
    signer[networkType]
  );
  let trade = await Trade.deployed();
  console.log("Trade address is " + trade.address);
  const tradeAddress = trade.address;

  console.log("*******************************");
  console.log("Signer: ", signer[networkType]);
  console.log("Treasury: ", treasurer[networkType]);
  console.log("Deploying on the " + networkType + " networkType");
  console.log("*******************************");
  console.log('"' + networkType + '": {');
  console.log(' "Identity": ' + '"' + identityAddress + '",');
  console.log(' "Currency": ' + '"' + coinAddress + '",');
  console.log(' "CurrencyProxy": ' + '"' + coinProxyAddress + '",');
  console.log(' "Inventory": ' + '"' + assetAddress + '",');
  console.log(' "InventoryProxy": ' + '"' + assetProxyAddress + '",');
  console.log(' "Trade": ' + '"' + tradeAddress + '",');
  console.log("}");
  console.log("*******************************");

//insert contract address into DB
  async function createAddress(identityAddress,coinAddress,assetAddress,coinProxyAddress,assetProxyAddress,tradeAddress,networkType) {
    const address = await sequelize.query(
    'INSERT ADDRESS_DATA(IDENTITY_VALUE,CURRENCY_VALUE,INVENTORY_VALUE,CURRENCY_PROXY_VALUE,INVENTORY_PROXY_VALUE,TRADE_VALUE,NETWORK_TYPE) VALUES (?,?,?,?,?,?,?)',
    {
      type: sequelize.QueryTypes.INSERT,
      replacements: [identityAddress,coinAddress,assetAddress,coinProxyAddress,assetProxyAddress,tradeAddress,networkType],
    },
    );
  }

  createAddress(identityAddress,coinAddress,assetAddress,coinProxyAddress,assetProxyAddress,tradeAddress,networkType);
};

