const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const followFollowerSchema = new mongoose.Schema({
	follower: {
		type: ObjectId,
		required: true
	},
	followee: {
		type: ObjectId,
		required: true
	},
	followedAt : Date
});

module.exports = mongoose.model("FollowFollower",followFollowerSchema);