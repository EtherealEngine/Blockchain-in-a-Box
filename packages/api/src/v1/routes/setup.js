const { DEVELOPMENT } = require("../../common/environment");
const { ResponseStatus } = require("../enums");
const { authenticateToken } = require("./auth");
const { setCorsHeaders } = require("../../common/utils");

async function addSetupRoutes(app) {
  /**
   * Login payload
   * @typedef {object} LoginPayload
   * @property {string} email.required - Email address of admin
   */
  /**
   * GET /api/v1/admin/login
   * @summary Get login email for admin
   * @security bearerAuth
   * @return {PlainResponse} 200 - success response
   * @return {AuthResponse} 401 - authentication error response
   * @param {LoginPayload} request.body.required - LoginPayload object for login
   */
  app.post("/api/v1/setup", authenticateToken, async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
    try {
      const {
        organizationName,
        sideChainUrl,
        sideChainMnemonic,
        sideChain2fa,
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
        pinataApiKey,
        pinataSecretApiKey,
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
}

module.exports = {
  addSetupRoutes,
};
