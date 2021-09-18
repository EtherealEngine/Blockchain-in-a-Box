module.exports = (sequelize, Sequelize) =>
  sequelize.define("ONBOARDING_DATA", {
    email: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    assetContractName:{
        type: Sequelize.STRING,
    },
    assetContractSymbol: {
      type: Sequelize.STRING,
    },
    assetTokenDescription: {
        type: Sequelize.STRING,
    },
    currencyContractName: {
      type: Sequelize.STRING,
    },
    currencyContractSymbol: {
        type: Sequelize.STRING,
    },
    currencyMarketCap: {
        type: Sequelize.STRING,
    },
    infuraApiKey: {
        type: Sequelize.STRING,
    },
    infuraProjectID: {
        type: Sequelize.STRING,
    },
    mainnetMnemonic: {
      type: Sequelize.STRING,
    },
    mintingFee: {
      type: Sequelize.STRING,
    },
    organizationName: {
      type: Sequelize.STRING,
    },
    polygonApiKey: {
      type: Sequelize.STRING,
    },
    polygonMnemonic: {
      type: Sequelize.STRING,
    },
    sidechainURL: {
      type: Sequelize.STRING,
    },
    signingAuthorityMnemonic: {
      type: Sequelize.STRING,
    },
    signingAuthorityPrivateKey: {
      type: Sequelize.STRING,
    },
    signingAuthorityAddress: {
      type: Sequelize.STRING,
    },
    treasuryMnemonic: {
      type: Sequelize.STRING,
    },
    treasuryPrivateKey: {
      type: Sequelize.STRING,
    },
    treasuryAddress: {
      type: Sequelize.STRING,
    },
    usersMintAssets: {
      type: Sequelize.STRING,
    },
    sidechainContractDeployed: {
      type: Sequelize.STRING,
    },
    mainnetContractDeployed: {
      type: Sequelize.STRING,
    },
    polygonContractDeployed: {
      type: Sequelize.STRING,
    },
    pinataApiKey: {
      type: Sequelize.STRING,
    },
    pinataApiSecretKey: {
      type: Sequelize.STRING,
    },
    maticVigilKey: {
      type: Sequelize.STRING,
    }
  },{
    timestamps: false
  });