const express = require("express");
const app = express();

const authRoutes=require('./routes/auth');
const fileUploadRoutes=require('./routes/images');
const userRoutes=require('./routes/users');

const mongoose=require('mongoose');
const bodyParser = require("body-parser");
require("dotenv").config();
const nodemailer = require("nodemailer");
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const cors = require('cors');

app.use(cors({
    origin:['http://localhost:8080'],
    methods:['GET','POST'],
    credentials: true // enable set cookie
}));

app.use(
  // Creates a session middleware with given options.
  session({
    name: 'sid',
    saveUninitialized: false,
    resave: false,
    secret: 'sssh, quiet! it\'s a secret!',
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2,      
      sameSite: true,
      secure: true
    }
  })
);


mongoose.connect(process.env.LOCAL_MONGO_URI,{useNewUrlParser:true},function (err) {
  
  if (err) throw err
  console.log("Connected to local mongo db database");

});

app.get("/",(req,res)=> {console.log("A request was made to /")
	console.log("/GET called");	
});


// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/",userRoutes);
app.use("/",authRoutes);

app.use("/",fileUploadRoutes);


const port = process.env.PORT||8080
app.listen(port,()=> {
	console.log("Hello world");
})