const express = require("express");
const router = express.Router();

const {
	signup,login,verifyemail,requiresLogin,getUsers
} = require("../handlers/auth");



router.post("/signup",signup);

router.post("/login",login);

router.get("/verifyemail/:token",verifyemail);

router.get("/getUsers",requiresLogin,getUsers);


module.exports=router;