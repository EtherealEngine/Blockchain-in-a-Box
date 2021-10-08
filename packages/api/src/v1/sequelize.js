const dotenv = require('dotenv');
dotenv.config();
const Sequelize = require('sequelize');
const UserModel = require('./models/usersData');
const AdminModel = require('./models/adminData');
const AddressDataModel = require('./models/addressData');
const EnvironmentDataModel = require('./models/environmentData');
const OnboardingDataModel = require('./models/onboardingData');
const TimerDataModel = require("./models/timerData");

const sequelize = new Sequelize('dev', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
});

const AdminData = AdminModel(sequelize, Sequelize);
const UserData = UserModel(sequelize, Sequelize);
const AddressData = AddressDataModel(sequelize, Sequelize);
const EnvironmentData = EnvironmentDataModel(sequelize, Sequelize);
const OnBoardingData = OnboardingDataModel(sequelize, Sequelize);
const TimerData = TimerDataModel(sequelize, Sequelize);

sequelize.sync().then(() => {
  // eslint-disable-next-line no-console
  console.log('Users db and user table have been created');

  
});



module.exports = { AdminData, AddressData, EnvironmentData, OnBoardingData, UserData, TimerData };