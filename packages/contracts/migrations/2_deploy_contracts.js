const Account = artifacts.require("WebaverseAccount");
const ERC20 = artifacts.require("WebaverseERC20");
const ERC20Proxy = artifacts.require("WebaverseERC20Proxy");
const ERC721 = artifacts.require("WebaverseERC721");
const ERC721Proxy = artifacts.require("WebaverseERC721Proxy");
const ERC721LAND = artifacts.require("WebaverseERC721");
const ERC721LANDProxy = artifacts.require("WebaverseERC721Proxy");
const Trade = artifacts.require("WebaverseTrade");

const chainId = require("../config/chainIds.js");

// FT
const ERC20ContractName = "SILK";
const ERC20Symbol = "SILK";
const ERC20MarketCap = "2147483648000000000000000000";

// NFTs
const ERC721TokenContractName = "ASSET";
const ERC721TokenContractSymbol = "ASSET";
const tokenIsSingleIssue = false;
const tokenIsPublicallyMintable = true;
const tokenBaseUri = "https://tokens.webaverse.com/";
const mintFee = 10;

// LAND
const ERC721LandContractName = "LAND";
const ERC721LandContractSymbol = "LAND";
const landIsSingleIssue = true;
const landIsPublicallyMintable = false;
const landBaseUri = "https://land.webaverse.com/";

const NetworkTypes = {
  "mainnet": "mainnet",
  "mainnetsidechain": "mainnetsidechain",
  "polygon": "polygon",
  "testnet": "testnet",
  "testnetsidechain": "testnetsidechain",
  "testnetpolygon": "testnetpolygon",
  "development": "development"
}

const treasurer = {
  "mainnet": process.env.mainnetTreasuryAddress,
  "mainnetsidechain": process.env.mainnetsidechainTreasuryAddress,
  "polygon": process.env.polygonTreasuryAddress,
  "testnet": process.env.testnetTreasuryAddress,
  "testnetsidechain": process.env.testnetsidechainTreasuryAddress,
  "testnetpolygon": process.env.testnetpolygonTreasuryAddress,
  "development": process.env.devTreasuryAddress
}

const signer = {
  "mainnet": process.env.mainnetSignerAddress,
  "mainnetsidechain": process.env.mainnetsidechainSignerAddress,
  "polygon": process.env.polygonSignerAddress,
  "testnet": process.env.testnetSignerAddress,
  "testnetsidechain": process.env.testnetsidechainSignerAddress,
  "testnetpolygon": process.env.testnetpolygonSignerAddress,
  "development": process.env.developmentSignerAddress
}

module.exports = async function (deployer) {
  const networkType = NetworkTypes[process.argv[4]];

  if (!networkType)
    return console.error(process.argv[4] + " was not found in the networkType list");

  console.log("Signer is", signer[networkType]);

  if (!signer[networkType])
    return console.error("Signer address not valid");

  console.log("Treasury is", treasurer[networkType]);

  if (!treasurer[networkType])
    return console.error("Treasury address not valid");

  console.log("Deploying on the " + networkType + " networkType");
  await deployer.deploy(Account)
  let account = await Account.deployed()
  console.log("Account address is " + account.address)

  await deployer.deploy(ERC20, ERC20ContractName, ERC20Symbol, 10)
  let erc20 = await ERC20.deployed()
  const ERC20Address = erc20.address;
  
  console.log("ERC20 address is " + ERC20Address);
  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(ERC20Proxy, ERC20Address, signer[networkType], chainId[networkType][ERC20ContractName])
  let erc20Proxy = await ERC20Proxy.deployed()
  const ERC20ProxyAddress = erc20Proxy.address;
  
  console.log("ERC20Proxy address is " + ERC20ProxyAddress);

  console.log("Attempting to deploy ERC721 contract with these variables")
  console.log(ERC721TokenContractName,
    ERC721TokenContractSymbol,
    tokenBaseUri,
    ERC20Address,
    mintFee,
    treasurer[networkType],
    tokenIsSingleIssue,
    tokenIsPublicallyMintable)
  /** name, symbol, baseUri, _erc20Contract, _mintFee, _treasuryAddress, _isSingleIssue, _isPublicallyMintable */
  await deployer.deploy(ERC721,
    ERC721TokenContractName,
    ERC721TokenContractSymbol,
    tokenBaseUri,
    ERC20Address,
    mintFee,
    treasurer[networkType],
    tokenIsSingleIssue,
    tokenIsPublicallyMintable)

  let erc721 = await ERC721.deployed()
  const ERC721Address = erc721.address;
  
  console.log("ERC721 Token address is " + ERC721Address);

  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(ERC721Proxy, ERC721Address, signer[networkType], chainId[networkType][ERC721TokenContractName])
  let erc721Proxy = await ERC721Proxy.deployed()

  const ERC721ProxyAddress = erc721Proxy.address;
  
  console.log("ERC721Proxy address is " + ERC721ProxyAddress);

  /** name, symbol, baseUri, _erc20Contract, _mintFee, _treasuryAddress, _isSingleIssue, _isPublicallyMintable */
  await deployer.deploy(
    ERC721LAND,
    ERC721LandContractName,
    ERC721LandContractSymbol,
    landBaseUri,
    ERC20Address,
    mintFee,
    treasurer[networkType],
    landIsSingleIssue,
    landIsPublicallyMintable)
    
    let erc721LAND = await ERC721LAND.deployed()
    
  console.log("ERC721 LAND address is " + erc721LAND.address);
  const ERC721LANDAddress = erc721LAND.address;
  /** parentAddress, signerAddress, _chainId */
  await deployer.deploy(ERC721LANDProxy, ERC721LANDAddress, signer[networkType], chainId[networkType][ERC721LandContractName])
  
  console.log("ERC721LANDProxy address is " + ERC721LANDProxy.address);

  /** parentERC20Address, parentERC721Address, signerAddress */
  await deployer.deploy(Trade, ERC20Address, ERC721Address, signer[networkType])
  let trade = await Trade.deployed()
  console.log("Trade address is " + trade.address);

  console.log("*******************************")
  console.log("Signer: ", signer[networkType]);
  console.log("Treasury: ", treasurer[networkType]);
  console.log("Deploying on the " + networkType + " networkType");
  console.log("*******************************")
  console.log("\"" + networkType + "\": {");
  console.log(" \"Account\": " + "\"" + account.address + "\",")
  console.log(" \"FT\": " + "\"" + ERC20Address + "\",");
  console.log(" \"FTProxy\": " + "\"" + ERC20ProxyAddress + "\",");
  console.log(" \"NFT\": " + "\"" + ERC721Address + "\",");
  console.log(" \"NFTProxy\": " + "\"" + ERC721ProxyAddress + "\",");
  console.log(" \"LAND\": " + "\"" + ERC721LANDAddress + "\",");
  console.log(" \"LANDProxy\": " + "\"" + ERC721LANDProxy.address + "\",");
  console.log("}");
  console.log("*******************************")

};
