const { AddressData } = require("../sequelize");
const { ResponseStatus } = require("../enums")

async function AddressRoutes(app){


    app.get("/api/v1/address-data", async (req,res,next)=>{
        try{
            let networkType  = req.query.networkType
            let email = req.query.email
            let data = await AddressData.findOne({ where: { networkType: networkType, email: email } });
            if(data)
                res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "Data":data}))
            else
                res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "Message": "Data cannot be fetched."}))
        }catch(err){
            res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "Message": "Data cannot be fetched."}))
        }
    })

}

module.exports = {
    AddressRoutes
};