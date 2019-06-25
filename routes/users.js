const express = require("express");
const router = express.Router();

const {
	follow,unfollow,getFollowers
} = require("../handlers/users");

const {
	requiresLogin
} = require("../handlers/auth");

router.get("/follow/:userid",requiresLogin,follow);

router.get("/unfollow/:userid",requiresLogin,unfollow);

router.get("/getFollowers",requiresLogin,getFollowers);

// router.get("getFollowing",requiresLogin,getFollowing);

module.exports=router;