const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require('mongoose');

const Pin = require("../models/pin");
const { ObjectId } = mongoose.Types;

const PinFeed =  require("../models/pinfeed");

const {
	requiresLogin
} = require("../handlers/auth");

const {
	uploadPin,getImageFeed
} = require("../handlers/images");

router.post('/uploadPin',requiresLogin,uploadPin);

router.get('/getImageFeed',requiresLogin,getImageFeed);

// router.get('')
router.post('/tUpdatePinfeed',requiresLogin, function(req,res){

	const currentUserId = req.payload.user._id;
	console.log(currentUserId);
	var pinFeedArr=[];
	User.find({},function(err,users){
		// console.log(user[0]);
		users.forEach(function(user){
			if(user) {
				const followers = user.followers;
				
				followers.forEach(function(follower){
					Pin.find({createdBy:ObjectId(user._id)},function(err,pins){
						console.log(pins);
						pinFeedArr=[];
						pins.forEach(pinn => {

							pinFeedArr.push({followedBy:ObjectId(follower._id),url:pinn.url,pin:pinn._id})
						});
						// console.log(pinFeedArr);
						PinFeed.insertMany(pinFeedArr,function(err,pins){
							if(!err)
							console.log("pins")
							else
							console.log('err');  
						});
					});	
				});
				
			}
		})
		
		
		
			
	});

	
	
});
module.exports = router;