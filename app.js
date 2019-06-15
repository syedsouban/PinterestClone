const express = require("express");
const app = express();
const authRoutes=require('./routes/auth');
const mongoose=require('mongoose');
const bodyParser = require("body-parser");
require("dotenv").config();
const nodemailer = require("nodemailer");


mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true},function (err) {
  
  if (err) throw err
  console.log("Connected to local mongo db database");

});

app.get("/",(req,res)=> {console.log("A request was made to /")
		console.log("/GET called");
		// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  from: 'test@example.com',
  to: 'syedsoubanw97@gmail.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg);
	
});

app.use(bodyParser.json());
app.use("/",authRoutes);

const port = process.env.PORT||8080
app.listen(port,()=> {
	console.log("Hello world");
})