const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Board = require("../models/board");
const mongoose = require('mongoose');

const FollowFollower =  require("../models/followfollower");

const Pin = require("../models/pin");
const { ObjectId } = mongoose.Types;

const PinFeed =  require("../models/pinfeed");

const {
	requiresLogin
} = require("../handlers/auth");

const {
	uploadPin,getImageFeed,updatePinDesc,deleteAPin,getPinsFromUserBoards
} = require("../handlers/images");

router.post('/uploadPin/:boardId',requiresLogin,uploadPin);

router.post('/updatePinDesc/:pinId',requiresLogin,updatePinDesc);

router.post('/deleteAPin/:pinId',requiresLogin,deleteAPin);

router.get('/getImageFeed/:pgno',requiresLogin,getImageFeed);

router.get('/getPinsFromUserBoards/:pgno',requiresLogin,getPinsFromUserBoards);

module.exports = router;