const express = require("express");
const {
	signup,login,verifyemail,requiresLogin,getUsers
} = require("../handler/auth")

const router = express.Router();

router.post("/signup",signup);

router.post("/login",login);

router.get("/verifyemail/:token",verifyemail);

router.get("/getUsers",requiresLogin,getUsers);



module.exports=router;