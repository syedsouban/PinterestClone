const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const boardSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
    },
    description: String,
    secret: Boolean,
    topic: String,
    createdBy: { type: ObjectId, ref: 'User'},
    pins: [{type: ObjectId, ref: 'Pin'}],
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model("Board", boardSchema);