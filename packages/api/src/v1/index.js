const expressJSDocSwagger = require("express-jsdoc-swagger");

const { createWallet } = require("./routes/wallet.js");
const { handleServerSideAuth, authenticateToken } = require("./routes/auth.js");
const {
  listTokens,
  createToken,
  readToken,
  deleteToken,
  sendToken,
  readTokenRange,
  signTransfer,
} = require("./routes/tokens.js");

const {
  getBlockchain,
} = require("@blockchain-in-a-box/common/src/blockchain.js");

let blockchain;

(async () => {
  blockchain = await getBlockchain();
})();

function addV1Routes(app) {
  const swaggerOptions = {
    info: {
      version: "v1",
      title: "Blockchain-in-a-Box API Documentation",
      description: "Documentation for the Blockchain-in-a-Box API server",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    filesPattern: "*.js",
    swaggerUIPath: "/v1/api-docs",
    baseDir: __dirname,
    exposeSwaggerUI: true,
    exposeApiDocs: true,
    apiDocsPath: "/api/v1/api-docs",
  };

  expressJSDocSwagger(app)(swaggerOptions);

  /**
   * Authentication payload
   * @typedef {object} AuthPayload
   * @property {string} authSecretKey.required -  Auth Secret Key
   */
  /**
   * Authentication response
   * @typedef {object} AuthResponse
   * @property {string} status - The status of the authentication request (success/error)
   * @property {string} accessToken - JWT token for authentication
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * POST /api/v1/authorizeServer
   * @summary Get authentication token
   * @param {AuthPayload} request.body.required - AuthPayload object for authentication
   * @return {AuthResponse} 200 - success response
   */
  app.post("/api/v1/authorizeServer", async (req, res) => {
    return await handleServerSideAuth(req, res);
  });

  // WALLETS

  /**
   * Response for user account creation and retrieval
   * @typedef {object} WalletCreationResponse
   * @property {string} status - The status of the creation request (success/error)
   * @property {string} userMnemonic - The private key for the user (to be stored and NEVER shared)
   * @property {string} userAddress - The public key for the user (to be stored)
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * POST /api/v1/wallet
   * @summary Create a wallet for a user
   * @security bearerAuth
   * @return {WalletCreationResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   */
  app.post("/api/v1/wallet", authenticateToken, async (req, res) => {
    return await createWallet(req, res);
  });

  // TOKENS

  /**
   * Response for user account creation and retrieval
   * @typedef {object} TokenResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {object} token - Token object returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} TokenIdResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {string} tokenId - Token id returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} TokenIdListResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {object} tokenIds - Token id returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} TokenListResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {object} tokens - Array of token objects returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} TokenStatusResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} TokenSignatureResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {string} tokenId - The ID fo the token being signed
   * @property {string} signature - The status of the list request (success/error)
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * GET /api/v1/tokens/:address/:mainnetAddress
   * @summary List tokens for a user
   * @security bearerAuth
   * @return {TokenListResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} address.path.required - Address of the user to list tokens for
   * @param {string} mainnetAddress.path.optional - Mainnet address of the user to list tokens for (optional)
   */
  app.get(
    "/api/v1/tokens/:address/:mainnetAddress?",
    authenticateToken,
    async (req, res) => {
      return await listTokens(req, res, blockchain.web3);
    }
  );

  /**
   * GET /api/v1/token/:tokenId
   * @summary Retrieve data for a non-fungible token
   * @security bearerAuth
   * @return {TokenResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} tokenId.path.required - Token to retrieve
   */
  app.get("/api/v1/token/:tokenId", authenticateToken, async (req, res) => {
    return await readToken(req, res);
  });

  /**
   * GET /api/v1/token/:tokenStartId/:tokenEndId
   * @summary Retrieve a range of tokens
   * @security bearerAuth
   * @return {TokenListResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} tokenStartId.path.required - First token to retrieve
   * @param {string} tokenEndId.path.required - Last token in range to retrieve
   */
  app.get(
    "/api/v1/token/:tokenStartId/:tokenEndId",
    authenticateToken,
    async (req, res) => {
      return await readTokenRange(req, res);
    }
  );

  /**
   * POST /api/v1/token
   * @summary Create a non-fungible token with a file or IPFS hash
   * @security bearerAuth
   * @return {TokenListResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} userMnemonic.required - Mint the token using a user's private key
   * @param {string} file.optional - File to upload to IPFS
   * @param {string} resourceHash.optional - IPFS resource hash or other URI
   * @param {number} quantity.optional; - Number of tokens to mint
   */
  app.post("/api/v1/token", authenticateToken, async (req, res) => {
    return await createToken(req, res, blockchain);
  });

  /**
   * DELETE /api/v1/token
   * @summary Burn a token forever
   * @security bearerAuth
   * @param {string} tokenId.required - Token to delete
   * @return {TokenStatusResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   */
  app.delete("/api/v1/token", authenticateToken, async (req, res) => {
    return await deleteToken(req, res, blockchain);
  });

  /**
   * POST /api/v1/token/send
   * @summary Send this token from one user to another
   * @security bearerAuth
   * @return {TokenStatusResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} tokenId.required - Token to be sent
   * @param {string} fromUserAddress.required - Token sent by this user (public address)
   * @param {string} toUserAddress.required - Token received by this user (public address)
   */
  app.post("/api/v1/token/send", authenticateToken, async (req, res) => {
    return await sendToken(req, res, blockchain);
  });

  /**
   * POST /api/v1/token/signTransfer
   * @summary Prepare a token to be transferred, either mainnet <-> sidechain or polygon <-> sidechain
   * @return {TokenSignatureResponse} 200 - success response
   * @return {object} 401 - forbidden request response
   * @property {string} tokenId - Token to be sent
   * @property {string} transferToChain - Transfer to this chain
   */
  app.post("/api/v1/token/signTransfer", async (req, res) => {
    return await signTransfer(req, res, blockchain);
  });
}

module.exports = {
  addV1Routes,
};
