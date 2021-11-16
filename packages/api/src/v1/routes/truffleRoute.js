const exec = require("child_process").exec;
const { OnBoardingData } = require("../sequelize");


async function TruffleRoutes(app){

    app.post("/api/v1/truffle-data", async (req,res,next)=>{
        const { email, networkType } = req.body;
        if (networkType=="development")
        {
            child = exec('npm run deploy-dev-reset '+email,function(error, stdout, stderr){
                
                console.log("=>");
                console.log(`stdout: ${stdout}`);
            })
            setTimeout(async function(){ 
            try{
                let data = await OnBoardingData.findOne({ where: { email : req.body.email } });
                if(data.email){
                    res.end(JSON.stringify({"Status" : 200,  "User": data}));
                }else{
                    res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
                }
            }catch{
                res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
            } }, 20000);

            
        }
        if (networkType=="mainnet")
        {
            child = exec('npm run deploy-mainnet-reset',function(error, stdout, stderr){
                
                console.log("=>");
                console.log(`stdout: ${stdout}`);
            })
            res.end(JSON.stringify(child));
        }
        
        if (networkType=="polygon")
        {
            child = exec('npm run deploy-polygon-reset',function(error, stdout, stderr){
                
                console.log("=>");
                console.log(`stdout: ${stdout}`);
            })
            res.end(JSON.stringify(child));
        }

        if(networkType == null){
            res.end(JSON.stringify({"Status":400, "Message": "Data cannot be fetched."}))
        }
    })

}

module.exports = {
    TruffleRoutes
};