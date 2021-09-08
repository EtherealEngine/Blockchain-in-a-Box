const express = require("express");
const cors = require('cors');
const fileUpload = require("express-fileupload");
const { addV1Routes } = require("./v1/index.js");
const HTTP_PORT = process.env.HTTP_PORT;
const DEVELOPMENT = !process.env.PRODUCTION;

const createDeployer = require("./deployer");

const app = express();

// websocket deployment console for truffle
createDeployer(3033);
app.use(cors());

app.use(fileUpload());

app.use(express.json());

let requestsLogger = (req, res, next) => {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" + (current_datetime.getMonth() + 1) +
    "-" + current_datetime.getDate() +
    " " + current_datetime.getHours() +
    ":" + current_datetime.getMinutes() +
    ":" + current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  let log = `[${formatted_date}] ${method}:${url} ${status}`;
  console.log(log);
  next();
};

if (DEVELOPMENT)
  app.use(requestsLogger);

addV1Routes(app);

app.listen(HTTP_PORT, (err) => {
  if (err) console.log(err);
  console.log(`App listening at http://localhost:${HTTP_PORT}`);
});

module.exports = {app};