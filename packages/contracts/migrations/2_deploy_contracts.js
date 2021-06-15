/* eslint-disable no-undef */
const Identity = artifacts.require("Identity");
const CoinContract = artifacts.require("Coin");
const CoinProxyContract = artifacts.require("CoinProxy");
const Asset = artifacts.require("Asset");
const AssetProxy = artifacts.require("AssetProxy");
const Trade = artifacts.require("Trade");

const chainId = require("../config/chainIds.js");

// COIN
const CoinContractName = process.env.CoinContractName;
const CoinContractSymbol = process.env.CoinContractSymbol;
const CoinMarketCap = process.env.CoinMarketCap;

// ASSETS
const assetContractName = process.env.ASSET_CONTRACT_NAME;
const assetContractSymbol = process.env.ASSET_CONTRACT_SYMBOL;
const assetsAreMintable = process.env.ASSETS_ARE_MINTABLE;
const assetBaseUri = process.env.ASSET_BASE_URI;
const mintFee = process.env.ASSET_CREATION_FEE;

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
  development: process.env.devTreasuryAddress,
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

  await deployer.deploy(CoinContract, CoinContractName, CoinContractSymbol, CoinMarketCap);
  let coin = await CoinContract.deployed();
  const coinAddress = coin.address;

  console.log("Coin contract address is " + coinAddress);
  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(
    CoinProxyContract,
    coinAddress,
    signer[networkType],
    chainId[networkType][CoinContractName]
  );
  let coinProxy = await CoinProxyContract.deployed();
  const coinProxyAddress = coinProxy.address;

  console.log("Coin proxy contract address is " + coinProxyAddress);

  console.log("Attempting to deploy Asset contract with these variables");
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
    Asset,
    assetContractName,
    assetContractSymbol,
    assetBaseUri,
    coinAddress,
    mintFee,
    treasurer[networkType],
    assetsAreMintable
  );

  let asset = await Asset.deployed();
  const assetAddress = asset.address;

  console.log("Asset address is " + assetAddress);

  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(
    AssetProxy,
    assetAddress,
    signer[networkType],
    chainId[networkType][assetContractName]
  );
  let erc721Proxy = await AssetProxy.deployed();

  const assetProxyAddress = erc721Proxy.address;

  console.log("AssetProxy address is " + assetProxyAddress);

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
  console.log(' "COIN": ' + '"' + coinAddress + '",');
  console.log(' "COINProxy": ' + '"' + coinProxyAddress + '",');
  console.log(' "ASSET": ' + '"' + assetAddress + '",');
  console.log(' "ASSETProxy": ' + '"' + assetProxyAddress + '",');
  console.log("}");
  console.log("*******************************");
};
