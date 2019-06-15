const express = require("express");
const {
	signup,login,verifyemail
} = require("../handler/auth")

const router = express.Router();

router.post("/signup",signup);

router.post("/login",login);

router.get("/verifyemail/:token",verifyemail)

module.exports=router;