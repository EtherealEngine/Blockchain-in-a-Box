const dotenv = require("dotenv");
require('dotenv').config();

dotenv.config({
  path: `../../.env`,
});
console.log(process.env.AUTH_SECRET_KEY)
const { Sequelize, Model, DataTypes } = require("sequelize");

//const Sequelize = require('sequelize');
console.log("in environment");
const sequelize = new Sequelize('dev', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
});
const { QueryTypes } = require('sequelize');

  async function getGlobal(){
    let data;
    try {
      data = await sequelize.query('SELECT dataKey,dataValue FROM `ENVIRONMENT_DATA`', {type: sequelize.QueryTypes.SELECT});
      //console.log("data",data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const globalData = getGlobal();
 

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const HTTP_PORT = process.env.HTTP_PORT;
const HTTPS_PORT = process.env.HTTPS_PORT;

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const SES_REGION = process.env.SES_REGION;
const SES_ACCESS_ID = process.env.SES_ACCESS_ID;
const SES_ACCESS_KEY = process.env.SES_ACCESS_KEY;
const SES_SENDER_ADDRESS = process.env.SES_SENDER_ADDRESS;

const CONSOLE_WEB_URL = process.env.CONSOLE_WEB_URL;

const DEVELOPMENT = !process.env.PRODUCTION;
const PRODUCTION = process != undefined && process.env.PRODUCTION;

module.exports = {
  INFURA_PROJECT_ID,
  AUTH_TOKEN_SECRET,
  AUTH_SECRET_KEY,
  HTTP_PORT,
  HTTPS_PORT,
  SES_REGION,
  SES_ACCESS_ID,
  SES_ACCESS_KEY,
  SES_SENDER_ADDRESS,
  CONSOLE_WEB_URL,
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
  DEVELOPMENT,
  PRODUCTION,
  globalData
};