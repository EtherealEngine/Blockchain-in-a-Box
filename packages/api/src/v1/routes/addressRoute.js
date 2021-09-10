const { AddressData } = require("../sequelize");

async function AddressRoutes(app){


    app.get("/api/v1/address-data", async (req,res,next)=>{
        let networkType  = req.query.networkType
        let email = req.query.email
        let data = await AddressData.findOne({ where: { networkType: networkType, email: email } });
        if(data)
            res.end(JSON.stringify({"Status":200, "Data":data}))
        else
            res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
    })

}

module.exports = {
    AddressRoutes
};