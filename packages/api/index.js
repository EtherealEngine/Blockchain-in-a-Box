require('dotenv').config();
const fs = require('fs');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

// api docs deps
const express = require('express');
const fileUpload = require('express-fileupload');
const { addV1Routes } = require("./api/v1/index.js");

let CERT = null;
let PRIVKEY = null;

const fullchainPath = './certs/fullchain.pem';
const privkeyPath = './certs/privkey.pem';
try {
  CERT = fs.readFileSync(fullchainPath);
} catch (err) {
  console.warn(`failed to load ${fullchainPath}`);
}
try {
  PRIVKEY = fs.readFileSync(privkeyPath);
} catch (err) {
  console.warn(`failed to load ${privkeyPath}`);
}

const PORT = parseInt(process.env.HTTP_PORT, 10) || 80;

const _makeApp = protocol => {
  const app = express();
  app.use(fileUpload());
  addV1Routes(app);
  return app;
};

const server = http.createServer(_makeApp('http:'));
server.on("upgrade", _ws("http:"));
const server2 = https.createServer(
  {
    cert: CERT,
    key: PRIVKEY,
  },
  _makeApp('https:')
);
server2.on("upgrade", _ws("https:"));

const _warn = err => {
  console.warn('uncaught: ' + err.stack);
};
process.on('uncaughtException', _warn);
process.on('unhandledRejection', _warn);

server.listen(HTTP_PORT);
server2.listen(HTTPS_PORT);

console.log(`http://127.0.0.1:${HTTP_PORT}`);
console.log(`https://127.0.0.1:${HTTPS_PORT}`);

})();