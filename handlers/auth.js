const User =  require("../models/user");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const fs = require("fs");
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
	
	const email = req.body.email;

	User.findOne({email},function(err,user){	
		if(err) return res.status(500).json({message:err.message});
		else if(user) return res.status(403).json({"message":"User exists"});
		
		const password = req.body.password;
		const name = req.body.name;

		bcrypt.hash(password, 10)
    	.then(async function(hashed_password) {

        	const user = await new User({email,name,hashed_password});
			await user.save(function(err){
				if(!err)
				res.send("User saved successfully");
			});
			
			// user.emailVerificationToken = crypto.randomBytes(20).toString('hex');
  			// user.emailVerificationTokenExpires = Date.now() + 3600000*24; 
        	// await user.save(function(err) {
			
			// if(!err) {	
  			// 	const resetURL = `http://${req.headers.host}/verifyemail/${user.emailVerificationToken}`;
			// 	const sgMail = require('@sendgrid/mail');
				
			// 	sgMail.setApiKey(process.env.SENDGRID_API_KEY);	
			// 	const msg = {
  			// 		from: 'admin@pinclone.com',
  			// 		to: email,
  			// 		subject: 'Email verification link',
  			// 		html: `Verify your email <a href="${resetURL}">here</a> to login to your account`,
			// 	};
			// 	sgMail.send(msg);

			// 	return res.json({message:"verify email address to login"});	
			// } 
			// 	return res.status(500).send({ message: err.message });
			// });
    	})
    	.catch(function(error){
        	res.status(500).send({message:error.message});
    	});
	});	
};

exports.login =  (req,res) => {
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({email},function(err,user) {
		if(err) return res.status(500).json({message:err.message});

		if(!user) return res.status(403).json({"message":"User does not exists"});

		bcrypt.compare(password,user.hashed_password, async (err,result) => {
			if(result) {
				// if(user.isVerified)
				{

					const token = await user.generateAuthToken();
					return res.status(200).json({"message":"successfully logged in",token});
				}
				// else
				// 	return res.status(403).json({"message":"user is not verified"});
			}
			else return res.status(403).json({message: "email address password do not match"});
		});
		
	});
};

exports.verifyemail = async (req,res) => {
	
	User.findOneAndUpdate({emailVerificationToken: req.params.token,emailVerificationTokenExpires: { $gt: Date.now() }}, {$set:{isVerified:true}}, {new: true}, (err, user) => {
    if (err) {
    	res.status(403).send({message:"Link invalid or expired"});
        // res.status(500).send({message:"Something wrong when updating data!"});
    }
    if(user) {
		res.status(200).send({"message":"email verification successful you can login now!"});
    }
	});	
};	

exports.requiresLogin = (req, res, next) => {
	if(!req.header('Authorization')) {
		res.status(403).send({message:"You are not authorized to access the resource"});
	}
	
	else {	
	const token = req.header('Authorization').replace('Bearer ', '')
	jwt.verify(token, process.env.JWT_KEY,function(err, payload) {
		if(payload) {
			req.payload=payload;
			next();
		}
		else if(err){
			res.sendStatus(403);
		}
	});
	}	
}

exports.getUsers = (req,res) => {
	User.find({},function(err,users){
		res.send(users);
	});
};

