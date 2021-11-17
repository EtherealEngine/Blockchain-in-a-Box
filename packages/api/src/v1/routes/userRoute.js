const { permittedCrossDomainPolicies } = require("helmet");
const { UserData } = require("../sequelize");
const { CONSOLE_WEB_URL, DEVELOPMENT, AUTH_SECRET_KEY, AUTH_TOKEN_SECRET } = require("../../common/environment");
const { setCorsHeaders } = require("../../common/utils.js");
const crypto = require("crypto");
const { ResponseStatus } = require("../enums");
const jwt = require("jsonwebtoken");
const { sendMessage } = require("../../common/sesClient");

async function UserRoutes(app){

    app.post("/api/v1/user-data", (req,res,next)=>{
        if (DEVELOPMENT) setCorsHeaders(res);
        let website = CONSOLE_WEB_URL;
         // Generate token
        let token = crypto.randomBytes(48).toString("hex");
        // Append slash at the end of website url
        if (website.endsWith("/") === false) {
            website += "/";
        }
        try{

        UserData.findOne({
                where: {
                  userEmail: req.body.userEmail || "",
                },
              }).then(userData=>{
                if(userData == null){
                    UserData.create(req.body).then(resp=>{
                        website = `${website}authenticate?email=${req.body.userEmail}&token=${token}&user=yes&admin=no&landing=dashboard`;
                        console.log(req.body.userEmail);
    
                        // Send email with login link and token
                        sendMessage(
                            req.body.userEmail,
                            "Login | Blockchain in a box",
                            `Greetings! you can access Blockchain in a box console from:\n\n
                            ${website}`,
                            `<h1>Login Information</h1>
                            <p>Greetings! you can access Blockchain in a box console from:</p>
                            <a href=${website}>${website}</a>`
                        );
                        res.end(JSON.stringify({"Status":200, "Message": "Data Submitted Successfully."}))
                    }).catch(function (err) {
                        res.end(JSON.stringify({"Status":400, "Message": "Data cannot be submitted."}))
                    })
                }else{
                    res.end(JSON.stringify({"Status":401, "Message": "User already exist."}))
                }
              })
        }catch{
            res.end(JSON.stringify({"Status":400, "Message": "Data cannot be submitted."}))
        }
    
})
  
    app.get("/api/v1/user-data", async (req,res,next)=>{
        try{
                let email  = req.query.email
                let data = await UserData.findAll({ where: { email: email } });
                if(data)
                    res.end(JSON.stringify({"Status":200, "Data":data}))
                else
                    res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
            }catch (err){
                res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
            }
    })
    
}


module.exports = {
    UserRoutes
};