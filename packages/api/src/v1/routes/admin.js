const crypto = require("crypto");
const { ResponseStatus } = require("../enums");
const { AdminData } = require("../sequelize");
const { setCorsHeaders } = require("../../common/utils");
const { sendMessage } = require("../../common/sesClient");
const { CONSOLE_WEB_URL, DEVELOPMENT, AUTH_SECRET_KEY, AUTH_TOKEN_SECRET } = require("../../common/environment");
const jwt = require("jsonwebtoken");

async function addAdminRoutes(app) {
  /**
   * FirstTime response
   * @typedef {object} FirstTimeResponse
   * @property {string} status - The status of the request (success/error)
   * @property {boolean} firstTime - If there is any existing user or first time
   * @property {string} error - If the status is error, the error can be read from here
   */
  /**
   * GET /api/v1/admin/firsttime
   * @summary Checks whether there is an existing user or its first time.
   * @return {FirstTimeResponse} 200 - success response
   */
  app.get("/api/v1/admin/firsttime", async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
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
        error: `Failed to get admin first time information. ${err.message}`,
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
   * @param {LoginPayload} request.body.required - LoginPayload object for login
   */
  app.post("/api/v1/admin/login", async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
    try {
      const { email } = req.body;

      // Verify if email was sent in request body
      if (!email) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Email was not found in request body.",
        });
      }

      let validEmail = validateEmail(email);
      // Verify if email was a valid email
      if (!validEmail) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Email was not a valid email.",
        });
      }

      // Generate token
      let token = crypto.randomBytes(48).toString("hex");

      // Insert or update database with token
      let adminObj = await AdminData.findOne({ where: { EMAIL: email } });
      if (adminObj) {
        await adminObj.update({ TOKEN: token });
      } else {
        let adminCount = await AdminData.count();
        // Only create if it was first time login.
        if (adminCount === 0) {
          await AdminData.create({ EMAIL: email, TOKEN: token });
        } else {
          return res.json({
            status: ResponseStatus.Error,
            error: "Unauthorized email.",
          });
        }
      }

      // Append slash at the end of website url
      let website = CONSOLE_WEB_URL;
      if (website.endsWith("/") === false) {
        website += "/";
      }
      website = website + "authenticate?email=" + email + "&token=" + token;

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

  /**
   * Authentication payload
   * @typedef {object} AuthenticationPayload
   * @property {string} email.required - Email address of admin.
   * @property {string} token.required - Login token of admin. (Received via email)
   */
  /**
   * Authentication response
   * @typedef {object} AuthenticationResponse
   * @property {string} status - The status of the request (success/error)
   * @property {string} accessToken - The access token for api requests
   * @property {string} organizationName - Organization name of user
   * @property {string} error - If the status is error, the error can be read from here
   */
  /**
   * GET /api/v1/admin/authentication
   * @summary Get login token verified
   * @security bearerAuth
   * @return {AuthenticationResponse} 200 - success response
   * @param {AuthenticationPayload} request.body.required - AuthenticationPayload object for authentication
   */
  app.post("/api/v1/admin/authentication", async (req, res) => {
    if (DEVELOPMENT) setCorsHeaders(res);
    try {
      const { email, token } = req.body;

      // Verify if email was sent in request body
      if (!email) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Email was not found in request body. Please login again.",
        });
      }

      let validEmail = validateEmail(email);
      // Verify if email was a valid email
      if (!validEmail) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Email was not a valid email. Please login again.",
        });
      }

      // Verify if token was sent in request body
      if (!token) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Token was not found in request body. Please login again.",
        });
      }

      // Validate login token
      let adminObj = await AdminData.findOne({ where: { EMAIL: email } });
      if (!adminObj) {
        return res.json({
          status: ResponseStatus.Error,
          error: "User not found. Please login again.",
        });
      }
      if (!adminObj.TOKEN || adminObj.TOKEN !== token) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Invalid login token. Please login again.",
        });
      }

      const accessToken = jwt.sign({ AUTH_SECRET_KEY }, AUTH_TOKEN_SECRET);

      return res.json({
        status: ResponseStatus.Success,
        accessToken,
        organizationName: adminObj.ORGANIZATION_NAME,
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

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = {
  addAdminRoutes,
};
