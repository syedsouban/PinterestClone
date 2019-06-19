const express = require("express");
const router = express.Router();

const {
	requiresLogin
} = require("../handlers/auth");

const {
	uploadPin,getImageFeed
} = require("../handlers/images");

router.post('/uploadPin',requiresLogin,uploadPin);

router.get('/getImageFeed',requiresLogin,getImageFeed);

// router.get('')

module.exports = router;