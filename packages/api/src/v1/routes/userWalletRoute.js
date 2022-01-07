const { permittedCrossDomainPolicies } = require("helmet");
const { UserWalletData } = require("../sequelize");
const { CONSOLE_WEB_URL, DEVELOPMENT, AUTH_SECRET_KEY, AUTH_TOKEN_SECRET } = require("../../common/environment");
const { setCorsHeaders } = require("../../common/utils.js");
const crypto = require("crypto");
const { ResponseStatus } = require("../enums");
const jwt = require("jsonwebtoken");
const { sendMessage } = require("../../common/sesClient");
const { createWalletInternal } = require("./wallet.js");
async function UserWalletRoutes(app){

    app.post("/api/v1/user-wallet-data", (req,res,next)=>{
        if (DEVELOPMENT) setCorsHeaders(res);
        try{
            createWalletInternal().then(walletData=>{
                console.log(walletData);
                let {userMnemonic,userAddress,privateKey} = walletData;
                let userData = {...req.body,userMnemonic,userAddress,userPrivateKey:privateKey};
                console.log(userData);
                UserWalletData.create(userData).then(resp=>{
                    res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "Message": "Data Submitted Successfully."}))
                }).catch(function (err) {
                    res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "Message": "Data cannot be submitted."}))
                })
                res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "Message": "Data submitted successfully."}))
            });
        
        }catch{
            res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "Message": "Data cannot be submitted."}))
        }
    
})
  
    app.get("/api/v1/user-wallet-data", async (req,res,next)=>{
        try{
                let userId  = req.query.userId
                let data = await UserWalletData.findAll({ where: { userId: userId } });
                if(data)
                    res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "Data":data}))
                else
                    res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "Message": "Data cannot be fetched."}))
            }catch (err){
                res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "Message": "Data cannot be fetched."}))
            }
    })
    
}


module.exports = {
    UserWalletRoutes
};