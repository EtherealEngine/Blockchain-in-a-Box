const { TimerData } = require("../sequelize");

async function TimerRoutes(app){


    app.post("/api/v1/initiate-timer", async (req,res,next)=>{
        const { type } = req.body
        if(type === "START"){
            // Take start time, email, rate/min and currency from request body
            let { startTime, email, ratePerMin, currency } = req.body

            // If start time exist take it, else take the current time
            startTime = startTime ? startTime : Date.now()

            // Create entry in database
            await TimerData.create({ startTime, email, ratePerMin, currency }) 

            // Find the entry made
            let user = await TimerData.findOne({where : { email : email }})

            // Show it to user as response
            res.end(JSON.stringify({ "status" : "SUCCESS", "startTime": user.dataValues.startTime }))
        }
        else if (type === "STOP"){
            // Take endtime and email from request body
            let { endTime, email } = req.body

             // If end time exist take it, else take the current time
             endTime = endTime ? startTime : Date.now()

            try {

                // Update where user email exist and endTime is null
                await TimerData.update(
                  { endTime },
                  { where: { email : email, endTime : null }}
                )

                // Find updated user from last
                let user = await TimerData.findOne({ where : { email, id : await TimerData.max('id', { where : { email }}) }})

                // Calculate time different and hence find the cost
                let timeDiff = Math.abs(new Date(user.endTime) - new Date(user.startTime))
                let cost = (timeDiff/(1000 * 60)) * user.ratePerMin

                // Update the newly fetched database reponse with the total cost
                let user_response = { "status" : "SUCCESS", ...user.dataValues, "Total" : cost}

                // Send response to the user
                res.end(JSON.stringify(user_response))
              } 
              
              catch (err) {
                res.end(JSON.stringify(err))
                }

             }else{

            // For any error send failed response to the user
            res.end(JSON.stringify({"status" : "Failed" }))
        }
    })

}

module.exports = {
    TimerRoutes
};