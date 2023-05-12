require('dotenv').config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const express = require("express");
const path = require("path");
const cors = require('cors');


const app = express();
app.use(cors());


// body parser middleware
app.use(express.json());
app.use(express.urlencoded()); // this is to handle URL encoded data
// end parser middleware

// enable static files pointing to the folder "public"
// this can be used to serve the index.html file
app.use(express.static(path.join(__dirname, "public")));

// HTTP POST
app.post("/", function(request, response) {

const data =  {email: request.body.email, first: request.body.first, last: request.body.last, message: request.body.message };


const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject();
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });

  return transporter;
};


//emailOptions - who sends what to whom
const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};


sendEmail({
  subject: "A Message From Your Website!",
  to: "cmsilvabarnbeck@gmail.com",
  from: process.env.EMAIL,
  text: `First: ${data.first}\nLast: ${data.last}\n\Email: ${data.email}\n Message: ${data.message}`,
});

console.log(request.body);
response.send("Working");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));

