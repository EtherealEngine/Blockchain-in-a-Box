const { EnvironmentData } = require("../sequelize");
const { ResponseStatus } = require("../enums");

async function environmentRoutes(app) {

    // Get Environment Data by DATA_KEY or fetch complete data
    app.get("/api/v1/environment-data", async (req,res,next)=>{
        let data_key_value = req.query.dataKey
        console.log(data_key_value)
            if(data_key_value){
                let data = await EnvironmentData.findOne({ where: { dataKey: data_key_value } });
                res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "Data":data}))
            }else{
                let data = await EnvironmentData.findAll();
                res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "Data":data}))
            }
    });

    // Insert DATA_KEY, DATA_VALUE and CREATED_BY
    app.post("/api/v1/environment-data", (req,res,next)=>{
        var { dataKey, dataValue, createdBy } = req.body
        try{
            EnvironmentData.create({
                dataKey, dataValue, createdBy
            }).then(resp=>{
                res.status(200).end(JSON.stringify({"status":ResponseStatus.Success, "message": "Data Submitted Successfully."}))
            }).catch(err=>{
                res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Data cannot be submitted."}))    
            })
        }catch{
            res.status(400).end(JSON.stringify({"status":ResponseStatus.Error, "message": "Data cannot be submitted."}))
        }
    })
}



module.exports = {
    environmentRoutes
};
  