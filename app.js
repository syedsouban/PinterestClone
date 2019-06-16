const express = require("express");
const app = express();
const authRoutes=require('./routes/auth');
const mongoose=require('mongoose');
const bodyParser = require("body-parser");
require("dotenv").config();
const nodemailer = require("nodemailer");
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const store = new RedisStore({
  host: 'localhost', port: 8080, pass: 'secret'
})



app.use(
  // Creates a session middleware with given options.
  session({

    store,

    // Name for the session ID cookie. Defaults to 'connect.sid'.
    name: 'sid',

    // Whether to force-save unitialized (new, but not modified) sessions
    // to the store. Defaults to true (deprecated). For login sessions, it
    // makes no sense to save empty sessions for unauthenticated requests,
    // because they are not associated with any valuable data yet, and would
    // waste storage. We'll only save the new session once the user logs in.
    saveUninitialized: false,

    // Whether to force-save the session back to the store, even if it wasn't
    // modified during the request. Default is true (deprecated). We don't
    // need to write to the store if the session didn't change.
    resave: false,

    // Whether to force-set a session ID cookie on every response. Default is
    // false. Enable this if you want to prolong session lifetime while the user
    // is still browsing the site. Beware that the module doesn't have an absolute
    // timeout option, so you'd need to handle indefinite sessions manually.
    // rolling: false,

    // Secret key to sign the session ID. The signature is used
    // to validate the cookie against any tampering client-side.
    secret: 'sssh, quiet! it\'s a secret!',

    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2,      
      sameSite: true,
      secure: process.env.NODE_ENV === 'production'
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

app.use(bodyParser.json());

app.use("/",authRoutes);

const port = process.env.PORT||8080
app.listen(port,()=> {
	console.log("Hello world");
})