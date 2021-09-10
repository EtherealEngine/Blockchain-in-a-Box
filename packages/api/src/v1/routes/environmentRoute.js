const { EnvironmentData } = require("../sequelize");

async function environmentRoutes(app) {

    // Get Environment Data by DATA_KEY or fetch complete data
    app.get("/api/v1/environment-data", async (req,res,next)=>{
        let data_key_value = req.query.dataKey
        console.log(data_key_value)
            if(data_key_value){
                let data = await EnvironmentData.findOne({ where: { dataKey: data_key_value } });
                res.end(JSON.stringify({"Status":200, "Data":data}))
            }else{
                let data = await EnvironmentData.findAll();
                res.end(JSON.stringify({"Status":200, "Data":data}))
            }
    });

    // Insert DATA_KEY, DATA_VALUE and CREATED_BY
    app.post("/api/v1/environment-data", (req,res,next)=>{
        var { dataKey, dataValue, createdBy } = req.body
        try{
            EnvironmentData.create({
                dataKey, dataValue, createdBy
            }).then(resp=>{
                res.end(JSON.stringify({"Status":200, "Message": "Data Submitted Successfully."}))
            })
        }catch{
            res.end(JSON.stringify({"Status":400, "Message": "Data cannot be submitted."}))
        }
    })
}



module.exports = {
    environmentRoutes
};
  