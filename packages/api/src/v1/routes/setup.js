const { DEVELOPMENT } = require("../../common/environment");
const { ResponseStatus } = require("../enums");
const { authenticateToken } = require("./auth");
const { setCorsHeaders } = require("../../common/utils");
const bip39 = require("bip39");

async function addSetupRoutes(app) {
  /**
   * Login payload
   * @typedef {object} LoginPayload
   * @property {string} email.required - Email address of admin
   */
  /**
   * GET /api/v1/setup/configure
   * @summary Get login email for admin
   * @security bearerAuth
   * @return {PlainResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {LoginPayload} request.body.required - LoginPayload object for login
   */
  app.post("/api/v1/setup/configure", authenticateToken, async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
    try {
      const {
        organizationName,
        sideChainUrl,
        sideChainMnemonic,
        treasuryMnemonic,
        currencyContractName,
        currencyContractSymbol,
        currencyContractMarketCap,
        assetContractName,
        assetContractSymbol,
        assetContractDescription,
        assetMintable,
        mintingFee,
        mainnetMnemonic,
        infuraProjectId,
        infuraApiKey,
        polygonMaticMnemonic,
        polygonVigilApiKey,
      } = req.body;

      // Verify if email was sent in request body
      if (!email) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Email was not found in request body.",
        });
      }

      return res.json({
        status: ResponseStatus.Success,
        error: null,
      });
    } catch (err) {
      return res.json({
        status: ResponseStatus.Error,
        error: err.message,
      });
    }
  });

  /**
   * Mnemonic response
   * @typedef {object} MnemonicResponse
   * @property {string} status - The status of the request (success/error)
   * @property {boolean} mnemonic - Randomly generated mnemonic
   * @property {string} error - If the status is error, the error can be read from here
   */
  /**
   * GET /api/v1/setup/mnemonic
   * @summary Generates a mnemonic.
   * @return {MnemonicResponse} 200 - success response
   */
  app.get("/api/v1/setup/mnemonic", async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
    try {
      let mnemonic = bip39.generateMnemonic();

      return res.json({
        status: ResponseStatus.Success,
        mnemonic,
        error: null,
      });
    } catch (err) {
      return res.json({
        status: ResponseStatus.Error,
        error: `Failed to get mnemonic. ${err.message}`,
      });
    }
  });

  /**
   * Mnemonic response
   * @typedef {object} VerifyMnemonicResponse
   * @property {string} status - The status of the request (success/error)
   * @property {boolean} isValid - Mnemonic is valid or not
   * @property {string} error - If the status is error, the error can be read from here
   */
  /**
   * GET /api/v1/setup/verifymnemonic
   * @summary Verify if the mnemonic is valid or not.
   * @return {VerifyMnemonicResponse} 200 - success response
   */
  app.post("/api/v1/setup/verifymnemonic", async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
    try {
      const { mnemonic } = req.body;
      let isValid = bip39.validateMnemonic(mnemonic);

      return res.json({
        status: ResponseStatus.Success,
        isValid,
        error: null,
      });
    } catch (err) {
      return res.json({
        status: ResponseStatus.Error,
        error: `Failed to validate mnemonic. ${err.message}`,
      });
    }
  });
}

module.exports = {
  addSetupRoutes,
};
