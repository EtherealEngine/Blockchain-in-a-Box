const crypto = require("crypto");
const { ResponseStatus } = require("../enums");
const { AdminData, OnBoardingData, UserData } = require("../sequelize");
const { setCorsHeaders } = require("../../common/utils");
const { sendMessage } = require("../../common/sesClient");
const { CONSOLE_WEB_URL, CONSOLE_WEB_URL_AUTHENTICATE, DEVELOPMENT, AUTH_SECRET_KEY, AUTH_TOKEN_SECRET } = require("../../common/environment");
const jwt = require("jsonwebtoken");

async function AdminRoutes(app) {
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
      let website = CONSOLE_WEB_URL;
      let website_authenticate = CONSOLE_WEB_URL_AUTHENTICATE
      console.log(website_authenticate)
      // Append slash at the end of website url
      // if (website.endsWith("/") === false) {
      //   website += "/";
      // }
      console.log(website, website_authenticate)
      let userObj = await UserData.findOne({where : { userEmail : email }})
      let adminObj = await AdminData.findOne({where : { email }})

      if(userObj === null && adminObj === null){
        await AdminData.create({ email, token })
        website = `${website_authenticate}?email=${email}&token=${token}&user=no&admin=yes&landing=onboarding`
      }
      else if(userObj!== null && adminObj === null){
        await userObj.update({ token })
        website = `${website_authenticate}?email=${email}&token=${token}&user=yes&admin=no&landing=dashboard`
      } else if(userObj === null && adminObj !== null){

        await adminObj.update({ token })
        let isOnboarded = await OnBoardingData.findOne({ where: { email  } });
        website = `${website_authenticate}?email=${email}&token=${token}&user=no&admin=yes&landing= ${(isOnboarded === null)?'onboarding':'dashboard'}`
      }else{
        res.status(400).end({"status":ResponseStatus.Error, "message":"Something went wrong! Try again after sometime."})
      }

      
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
      let adminObj = await AdminData.findOne({ where: { email: email } });
      if (!adminObj) {
        return res.json({
          status: ResponseStatus.Error,
          error: "User not found. Please login again.",
        });
      }
      if (!adminObj.token || adminObj.token !== token) {
        return res.json({
          status: ResponseStatus.Error,
          error: "Invalid login token. Please login again.",
        });
      }

      const accessToken = jwt.sign({ AUTH_SECRET_KEY }, AUTH_TOKEN_SECRET);

      return res.json({
        status: ResponseStatus.Success,
        accessToken,
        organizationName: adminObj.organizationName,
        error: null,
      });
    } catch (err) {
      return res.json({
        status: ResponseStatus.Error,
        error: err.message,
      });
    }
  });

  // Endpoint to get Store data and push it to dev in AWS : Port : 8080
  app.post("/api/v1/onboarding-data",async (req, res) => {
    console.log(req.body)
    // console.log(await OnBoardingData.destroy({where : { email: req.body.data.email}}))
    try{
      OnBoardingData.destroy({
        where: {
          email: req.body.data.email //this will be your id that you want to delete
        }
     }).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
      // console.log(rowDeleted)
      if(rowDeleted === 1){
          console.log('Deleted successfully');
        }
     })   
     try{
      OnBoardingData.create(req.body.data).then( (result) => {
        console.log("Result =>",result)
        res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "message": "Data Submitted Successfully."}))
      }, (err)=>{
        res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Some error occured!"}))
      })
     }catch{
      res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Some error occured!"}))
     } 
    }catch{
      res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Data cannot be submitted."}))
    }
  })

  // Get data by dataKey
  app.get("/api/v1/onboarding-data",async (req, res) =>{
    console.log("=>",req.query.email)
      try{
        let data = await OnBoardingData.findOne({ where: { email : req.query.email } });
        if(data.email){
          res.status(200).end(JSON.stringify({"status":ResponseStatus.Success,  "user": data}));
        }else{
          res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Data cannot be fetched."}))
        }
      }catch{
        res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Data cannot be fetched."}))
      }
      
  })

}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = {
  AdminRoutes,
};
