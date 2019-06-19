const express = require("express");
const router = express.Router();

const {
	follow,unfollow
} = require("../handlers/users");

const {
	requiresLogin
} = require("../handlers/auth");

router.get("/follow/:userid",requiresLogin,follow);

router.get("/unfollow/:userid",requiresLogin,unfollow);



module.exports=router;