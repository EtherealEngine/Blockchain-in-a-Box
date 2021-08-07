const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const {
  SES_REGION,
  SES_ACCESS_ID,
  SES_ACCESS_KEY,
  SES_SENDER_ADDRESS,
} = require("./environment.js");

// Create SES service object.
const sesClient = new SESClient({
  region: SES_REGION,
  credentials: {
    accessKeyId: SES_ACCESS_ID,
    secretAccessKey: SES_ACCESS_KEY,
  },
});

async function sendMessage(toAddress, subject, message, messageHtml) {
  try {
    // Set the parameters
    const params = {
      Destination: {
        CcAddresses: [],
        ToAddresses: [toAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: messageHtml,
          },
          Text: {
            Charset: "UTF-8",
            Data: message,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: SES_SENDER_ADDRESS,
      ReplyToAddresses: [],
    };

    const data = await sesClient.send(new SendEmailCommand(params));
    console.log("Success", data);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
}

module.exports = {
  sendMessage,
};
