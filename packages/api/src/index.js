const express = require('express');
const fileUpload = require('express-fileupload');
const {addV1Routes} = require("./v1/index.js");
const {HTTP_PORT} = require("@blockchain-in-a-box/common/src/environment.js");

const app = express();

app.use(fileUpload());

addV1Routes(app);

app.listen(HTTP_PORT, (err) => 
{
  if (err) console.log(err);
  console.log(`App listening at http://localhost:${HTTP_PORT}`)
});