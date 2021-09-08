const { setCorsHeaders } = require("../../common/utils.js");
const { ResponseStatus } = require("../enums.js");
const {
  DEVELOPMENT,
  AUTH_TOKEN_SECRET,
  AUTH_SECRET_KEY,
} = require("../../common/environment.js");

const jwt = require("jsonwebtoken");

 function authenticateToken(req, res, next) {  
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("AUTH_TOKEN_SECRET",AUTH_TOKEN_SECRET);
  if (!token) return res.status(401).send();

  jwt.verify(token, AUTH_TOKEN_SECRET, (error, data) => {
    if (error) return res.sendStatus(403);

    const { authSecretKey } = data;
    console.log(AUTH_TOKEN_SECRET);
    if (AUTH_SECRET_KEY !== authSecretKey) return res.sendStatus(403);

    next();
  });
}

// Compares a shared secret key and
async function handleServerSideAuth(req, res) {
  console.log("Iam",AUTH_SECRET_KEY,DEVELOPMENT);
  if (DEVELOPMENT) setCorsHeaders(res);
  
  const { authSecretKey } = req.body;

  if (!authSecretKey)
    return res.json({
      status: ResponseStatus.Error,
      accessToken: null,
      error: "authSecretKey value was not found",
    });

  if (authSecretKey != AUTH_SECRET_KEY)
    return res.json({
      status: ResponseStatus.Error,
      accessToken: null,
      error: "authSecretKey value was invalid",
    });

  const accessToken = jwt.sign({ authSecretKey }, AUTH_TOKEN_SECRET);

  return res.json({ status: ResponseStatus.Success, accessToken, error: null });
}

module.exports = {
  handleServerSideAuth,
  authenticateToken,
};
