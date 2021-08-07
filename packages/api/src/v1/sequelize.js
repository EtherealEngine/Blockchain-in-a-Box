const dotenv = require('dotenv');
dotenv.config({
  path: `./../../.env`,
});
const Sequelize = require('sequelize');
const AdminModel = require('./models/adminData');
const AddressDataModel = require('./models/addressData');
const EnvironmentDataModel = require('./models/environmentData');

const sequelize = new Sequelize('dev', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
});

const AdminData = AdminModel(sequelize, Sequelize);
const AddressData = AddressDataModel(sequelize, Sequelize);
const EnvironmentData = EnvironmentDataModel(sequelize, Sequelize);

sequelize.sync().then(() => {
  // eslint-disable-next-line no-console
  console.log('Blockchain in a box db and tables have been created');
});

module.exports = { AdminData, AddressData, EnvironmentData };
