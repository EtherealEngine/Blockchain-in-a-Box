const crypto = require("crypto");
const { ResponseStatus } = require("../enums");
const { AdminData } = require("../sequelize");
const { authenticateToken } = require("./auth");
const { sendMessage } = require("../../common/sesClient");
const { CONSOLE_WEB_URL } = require("../../common/environment");

async function addAdminRoutes(app) {
  /**
   * FirstTime response
   * @typedef {object} FirstTimeResponse
   * @property {string} status - The status of the request (success/error)
   * @property {boolean} firstTime - If there is any existing user or first time
   * @property {string} error - If the status is error, the error can be read from here
   */
  /**
  /**
   * GET /api/v1/admin/firsttime
   * @summary Checks whether there is an existing user or its first time.
   * @return {FirstTimeResponse} 200 - success response
   */
  app.get("/api/v1/admin/firsttime", async (req, res) => {
    try {
      let adminCount = await AdminData.count();

      return res.json({
        status: ResponseStatus.Success,
        firstTime: adminCount === 0,
        error: null,
      });
    } catch (err) {
      return res.json({
        status: ResponseStatus.Error,
        error: `Failed to get admin firsttime information. ${err.message}`,
      });
    }
  });

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
  app.post("/api/v1/admin/login", authenticateToken, async (req, res) => {
    try {
      const { email } = req.body;

      // Verify if email was sent in request body
      if (!email) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Email was not found in request body.",
        });
      }

      // Generate token
      let token = crypto.randomBytes(48).toString("hex");

      // Insert or update database with token
      let adminObj = await AdminData.findOne({ where: { EMAIL: email } });
      if (adminObj) {
        await adminObj.update({ TOKEN: token });
      } else {
        await AdminData.create({ EMAIL: email, TOKEN: token });
      }

      // Append slash at the end of website url
      let website = CONSOLE_WEB_URL;
      if (website.endsWith("/") === false) {
        website += "/";
      }
      website = website + "login?token=" + token;

      // Send email with login link and token
      sendMessage(
        email,
        "Login | Blockchain in a box",
        `Greetings! you can access Blockchain in a box console from:\n\n
        ${website}`,
        `<h1>Login Information</h1>
        <p>Greetings! you can access Blockchain in a box console from:</p>
        <a href=${website}>${website}</a>`
      );

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
  addAdminRoutes,
};
