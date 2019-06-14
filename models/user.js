const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
	bio: String,
	website: String
});


module.exports = mongoose.model("User", userSchema);