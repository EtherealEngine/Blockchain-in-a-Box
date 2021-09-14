const exec = require("child_process").exec;

async function TruffleRoutes(app){


    app.post("/api/v1/truffle-data", async (req,res,next)=>{
        const { email, networkType } = req.body;
        if (networkType=="development")
        {
            child = exec('npm run deploy-dev-reset '+email,function(error, stdout, stderr){
                
                console.log("=>");
                /*
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }*/
                console.log(`stdout: ${stdout}`);
            })
            res.end(JSON.stringify(child));
        }
        if (networkType=="mainnet")
        {
            child = exec('npm run deploy-mainnet-reset',function(error, stdout, stderr){
                
                console.log("=>");
                /*
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }*/
                console.log(`stdout: ${stdout}`);
            })
            res.end(JSON.stringify(child));
        }
        if (networkType=="polygon")
        {
            child = exec('npm run deploy-polygon-reset',function(error, stdout, stderr){
                
                console.log("=>");
                /*
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }*/
                console.log(`stdout: ${stdout}`);
            })
            res.end(JSON.stringify(child));
        }
    })

}

module.exports = {
    TruffleRoutes
};