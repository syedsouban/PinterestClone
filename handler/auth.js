const User =  require("../models/user");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
			user.emailVerificationToken = crypto.randomBytes(20).toString('hex');
  			user.emailVerificationTokenExpires = Date.now() + 3600000; // 1 hour from now
        	await user.save(function(err) {
			
			if(!err) {

  				
  				const resetURL = `http://${req.headers.host}/verifyemail/${user.emailVerificationToken}`;
				const sgMail = require('@sendgrid/mail');
				
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);	
				const msg = {
  					from: 'admin@pinclone.com',
  					to: email,
  					subject: 'Email verification link',
  					html: `Verify your email <a href="${resetURL}">here</a> to login to your account`,
				};
				sgMail.send(msg);

				return res.json({message:"verify email address to login"});	
			} 
				return res.status(500).send({ message: err.message });
			});
    	})
    	.catch(function(error){
        	res.status(500).send({message:error.message});
    	});
	});	
};

exports.login = (req,res) => {
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({email},function(err,user) {
		if(err) return res.status(500).json({message:err.message});

		if(!user) return res.status(403).json({"message":"User does not exists"});

		
		bcrypt.compare(password,user.hashed_password,(err,result) => {
			if(result) return res.status(200).json({"message":"success"});
			else return res.status(403).json({message: "email address password do not match"});
		});
		
	});
};

exports.verifyemail = async (req,res) => {
	// const emailVerificationToken = req.params.token;
	const user = await User.findOneAndUpdate({
    emailVerificationToken: req.params.token,
    emailVerificationTokenExpires: { $gt: Date.now() }
  	},
  	{$set:{isVerified:true}}
  	)
	.then(function(res){

	})
	.catch(function(err){
		res.status(500).send({message:err.message});
	});
	
	if(!user) {
		res.status(403).send({"message":"Password reset is invalid or has expired"});
	}

	res.status.send({"message":"email verification successful you can login now!"});
};	
