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


// userSchema
//     .virtual("password")
//     .set(function(password) {
//         this._password = password;
//         this.hashed_password = this.encryptPassword(password);
//     })
//     .get(function() {
//         return this._password;
//     });

// userSchema.methods = {
//     authenticate: function(plainText) {
//         return this.encryptPassword(plainText) === this.hashed_password;
//     },

//     encryptPassword: async function(password) {
//         if (!password) return "";
//         await bcrypt.hash(password,10,function(err,hash){
// 			if(err) throw err;
// 			return hash;
// 		});
//     }
// };



module.exports = mongoose.model("User", userSchema);