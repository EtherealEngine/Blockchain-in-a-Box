const expressJSDocSwagger = require("express-jsdoc-swagger");

const { createWallet } = require("./routes/wallet.js");

const { handleServerSideAuth, authenticateToken } = require("./routes/auth.js");

const {
  listAssets,
  createAsset,
  readAsset,
  deleteAsset,
  sendAsset,
  readAssetRange,
  signTransfer,
} = require("./routes/assets.js");

const {
  getBlockchain,
} = require("../common/blockchain.js");

let blockchain;

(async () => {
  blockchain = await getBlockchain();
})();

function addV1Routes(app) {
  /**
   * Send setup form page to user
   * 
   */
   app.get('/', function (req, res, next) {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(
      `
        <html>
        <head>
        <title>Setup</title>
        </head>
        <body>
        <form>
          <label for="MAINNET_MNEMONIC">Mainnet Private Key</label><br /> <input name="MAINNET_MNEMONIC" type="text" value="MAINNET_MNEMONIC" />
          <br>
          <label for="INFURA_PROJECT_ID">Infura Project ID</label><br /> <input name="INFURA_PROJECT_ID" type="text" value="INFURA_PROJECT_ID" />
          <br>
          <label for="INFURA_API_KEY">Infura API Key</label><br /> <input name="INFURA_API_KEY" type="text" value="INFURA_API_KEY" />
          <br>
          <label for="INFURA_PROJECT_ID">Infura Project ID</label><br /> <input name="INFURA_PROJECT_ID" type="text" value="INFURA_PROJECT_ID" />
          <br>
          <label for="PINATA_API_KEY">Pinata API Key</label><br /> <input name="PINATA_API_KEY" type="text" value="PINATA_API_KEY" />
          <br>
          <label for="PINATA_SECRET_API_KEY">Pinata Secret API Key</label><br /> <input name="PINATA_SECRET_API_KEY" type="text" value="PINATA_SECRET_API_KEY" />
          <br>

          <label for="DEFAULT_ASSET_DESCRIPTION">Mainnet Private Key</label><br /> <input name="MAINNET_MNEMONIC" type="text" value="MAINNET_MNEMONIC" />
          <br>
          <label for="MINTING_FEE">Infura Project ID</label><br /> <input name="INFURA_PROJECT_ID" type="text" value="INFURA_PROJECT_ID" />
          <br>
          <label for="CurrencyContractName">Infura API Key</label><br /> <input name="INFURA_API_KEY" type="text" value="INFURA_API_KEY" />
          <br>
          <label for="CoinContractSymbol">Infura Project ID</label><br /> <input name="INFURA_PROJECT_ID" type="text" value="INFURA_PROJECT_ID" />
          <br>
          <label for="CoinMarketCap">Pinata API Key</label><br /> <input name="PINATA_API_KEY" type="text" value="PINATA_API_KEY" />
          <br>
          <label for="ASSET_CONTRACT_NAME">Pinata Secret API Key</label><br /> <input name="PINATA_SECRET_API_KEY" type="text" value="PINATA_SECRET_API_KEY" />
          <br>
          <label for="ASSET_CONTRACT_NAME">Pinata Secret API Key</label><br /> <input name="PINATA_SECRET_API_KEY" type="text" value="PINATA_SECRET_API_KEY" />
          <br>
          <label for="ASSET_CONTRACT_SYMBOL">Pinata Secret API Key</label><br /> <input name="PINATA_SECRET_API_KEY" type="text" value="PINATA_SECRET_API_KEY" />
          <br>
          <label for="ASSETS_ARE_MINTABLE">Users Can mint Assets</label><br /><input name="ASSETS_ARE_MINTABLE" type="checkbox" value="1" />
          <br>
          <button type="submit" value="Submit">Submit</button>
        </form>

        // Dynamically generated
        AUTH_SECRET_KEY="<generate>"
        AUTH_TOKEN_SECRET="<generate>"
        
        // Programmatically set
        ETHEREUM_HOST="ethereum.example.org"
        ASSET_BASE_URI=""
        HTTP_PORT=8080
        HTTPS_PORT=8443
        REDIS_PORT=6379
        REDIS_HOST=
        REDIS_KEY="default"

        // User customizations
        DEFAULT_ASSET_DESCRIPTION=""
        MINTING_FEE=0<autofill>
        CurrencyContractName="Coin"<autofill>
        CoinContractSymbol="COIN"<autofill>
        CoinMarketCap=116340000<autofill>
        ASSET_CONTRACT_NAME="Asset"<autofill>
        ASSET_CONTRACT_SYMBOL="ASSET"<autofill>
        ASSETS_ARE_MINTABLE=true<autofill>
        </body>
        </html>
      `

    ));
  });

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
   * @property {string} accessAsset - JWT asset for authentication
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * POST /api/v1/authorizeServer
   * @summary Get authentication asset
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

  // ASSETS

  /**
   * Response for user account creation and retrieval
   * @typedef {object} AssetResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {object} asset - Asset object returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} AssetIdResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {string} assetId - Asset id returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} AssetIdListResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {object} assetIds - Asset id returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} AssetListResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {object} assets - Array of asset objects returned
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} AssetStatusResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * Response for user account creation and retrieval
   * @typedef {object} AssetSignatureResponse
   * @property {string} status - The status of the list request (success/error)
   * @property {string} assetId - The ID fo the asset being signed
   * @property {string} signature - The status of the list request (success/error)
   * @property {string} error - If the status is error, the error can be read from here
   */

  /**
   * GET /api/v1/assets/:address/:mainnetAddress
   * @summary List assets for a user
   * @security bearerAuth
   * @return {AssetListResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} address.path.required - Address of the user to list assets for
   * @param {string} mainnetAddress.path.optional - Mainnet address of the user to list assets for (optional)
   */
  app.get(
    "/api/v1/assets/:address/:mainnetAddress?",
    authenticateToken,
    async (req, res) => {
      return await listAssets(req, res, blockchain.web3);
    }
  );

  /**
   * GET /api/v1/asset/:assetId
   * @summary Retrieve data for a non-fungible asset
   * @security bearerAuth
   * @return {AssetResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} assetId.path.required - Asset to retrieve
   */
  app.get("/api/v1/asset/:assetId", authenticateToken, async (req, res) => {
    return await readAsset(req, res);
  });

  /**
   * GET /api/v1/asset/:assetStartId/:assetEndId
   * @summary Retrieve a range of assets
   * @security bearerAuth
   * @return {AssetListResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} assetStartId.path.required - First asset to retrieve
   * @param {string} assetEndId.path.required - Last asset in range to retrieve
   */
  app.get(
    "/api/v1/asset/:assetStartId/:assetEndId",
    authenticateToken,
    async (req, res) => {
      return await readAssetRange(req, res);
    }
  );

  /**
   * POST /api/v1/asset
   * @summary Create a non-fungible asset with a file or IPFS hash
   * @security bearerAuth
   * @return {AssetListResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} userMnemonic.required - Mint the asset using a user's private key
   * @param {string} file.optional - File to upload to IPFS
   * @param {string} resourceHash.optional - IPFS resource hash or other URI
   * @param {number} quantity.optional; - Number of assets to mint
   */
  app.post("/api/v1/asset", authenticateToken, async (req, res) => {
    return await createAsset(req, res, blockchain);
  });

  /**
   * DELETE /api/v1/asset
   * @summary Burn a asset forever
   * @security bearerAuth
   * @param {string} assetId.required - Asset to delete
   * @return {AssetStatusResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   */
  app.delete("/api/v1/asset", authenticateToken, async (req, res) => {
    return await deleteAsset(req, res, blockchain);
  });

  /**
   * POST /api/v1/asset/send
   * @summary Send this asset from one user to another
   * @security bearerAuth
   * @return {AssetStatusResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {string} assetId.required - Asset to be sent
   * @param {string} fromUserAddress.required - Asset sent by this user (public address)
   * @param {string} toUserAddress.required - Asset received by this user (public address)
   */
  app.post("/api/v1/asset/send", authenticateToken, async (req, res) => {
    return await sendAsset(req, res, blockchain);
  });

  /**
   * POST /api/v1/asset/signTransfer
   * @summary Prepare a asset to be transferred, either mainnet <-> sidechain or polygon <-> sidechain
   * @return {AssetSignatureResponse} 200 - success response
   * @return {object} 401 - forbidden request response
   * @property {string} assetId - Asset to be sent
   * @property {string} transferToChain - Transfer to this chain
   */
  app.post("/api/v1/asset/signTransfer", async (req, res) => {
    return await signTransfer(req, res, blockchain);
  });
}

module.exports = {
  addV1Routes,
};
