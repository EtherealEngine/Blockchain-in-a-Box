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

//(async() => {
  async function getPastEvents(){
    let data;
    try {
      data = await sequelize.query('SELECT DATA_KEY,DATA_VALUE FROM `ENVIRONMENT_DATA`', {type: sequelize.QueryTypes.SELECT});
      //console.log("data",data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  //Save response on a variable
  const globalData = getPastEvents();
  //return await asyncGlobal();
  /*
  globalData.then(function(result) {
    for (i in result )
    {
      console.log("result 1",result[i]); 
    }
  });
  */
  //console.log("globalData",getPastEvents());
//})();
//console.log("globalData",globalData);

/*
const express = require("express");
const fetch = require("node-fetch");

var request = require('request');

request('https://pq3j3a4qg8.execute-api.us-west-1.amazonaws.com/prod/environment', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      }
})
*/

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