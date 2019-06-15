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
	
	
	
});

app.use(bodyParser.json());
app.use("/",authRoutes);

const port = process.env.PORT||8080
app.listen(port,()=> {
	console.log("Hello world");
})