const { permittedCrossDomainPolicies } = require("helmet");
const { UserData } = require("../sequelize");

async function UserRoutes(app){

    app.post("/api/v1/user-data", (req,res,next)=>{
            try{
                UserData.create(req.body).then(resp=>{
                    res.end(JSON.stringify({"Status":200, "Message": "Data Submitted Successfully."}))
                })
            }catch{
                res.end(JSON.stringify({"Status":400, "Message": "Data cannot be submitted."}))
            }
        
    })
  
    app.get("/api/v1/user-data", async (req,res,next)=>{
        let email  = req.query.email
        let data = await UserData.findAll({ where: { email: email } });
        if(data)
            res.end(JSON.stringify({"Status":200, "Data":data}))
        else
            res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
    })
    
}


module.exports = {
    UserRoutes
};