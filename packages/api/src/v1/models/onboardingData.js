module.exports = (sequelize, Sequelize) =>
  sequelize.define("ONBOARDING_DATA", {
    email: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
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
    treasuryMnemonic: {
      type: Sequelize.STRING,
    },
    usersMintAssets: {
      type: Sequelize.STRING,
    }
  },{
    timestamps: false
  });