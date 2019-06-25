const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const pinSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
    },
    url: {
        type: String,
        required: true
    },
	description: {
		type: String,
	},
    website: String,
    tags : [String],
    createdBy: { type: ObjectId, ref: 'User'},
    boardId:{type: ObjectId, ref: 'Board'},
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model("Pin", pinSchema);