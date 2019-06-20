const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const pinFeedSchema = new mongoose.Schema({
    followedBy: { type: ObjectId, ref: 'User'},
    pin: {type: ObjectId, ref: 'Pin'},
    url: String
});

module.exports = mongoose.model("PinFeed", pinFeedSchema);