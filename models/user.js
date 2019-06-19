const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
	name: 
	{
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	hashed_password: {
        type: String,
        required: true
    },
    isVerified: {
    	type:Boolean,
    	default: false
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
	followers: [{ type: ObjectId, ref: 'User'}],
	following: [{ type: ObjectId, ref: 'User'}],
	pins: [{type: ObjectId, ref: 'Pin'}],
	bio: String,
	website: String
});

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
	const user = this
	user.hashed_password=undefined;
	user.emailVerificationToken=undefined;
	user.emailVerificationTokenExpires=undefined;
    const token = jwt.sign({user}, process.env.JWT_KEY);
    return token;
}


module.exports = mongoose.model("User", userSchema);