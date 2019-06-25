const User =  require("../models/user");
const FollowFollower =  require("../models/followfollower");
const {
    requiresLogin
} = require("../routes/auth");

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

exports.follow = (req, res) => {
    const toBeFollowedUserId = req.params.userid;
    const currentUserId = req.payload.user._id;
    if(toBeFollowedUserId===currentUserId)    
        res.status(403).send({"message":"You cannot follow yourself!"});
    
    FollowFollower.findOne({follower:currentUserId,followee:toBeFollowedUserId},(err,followfollower) => {
        if(err)
            res.status(500).send(err);
        else if(followfollower) {
            console.log(followfollower);
            res.send("You are already following the userr");
        }
        else if(!followfollower){
            const followfollowerObj = new FollowFollower({follower:currentUserId,followee:toBeFollowedUserId});
            followfollowerObj.save((err,result)=>{
                if(err)
                    res.status(500).send(err);
                if(result)
                    res.send("Successfully followed user");
                else if(!result)
                    res.status(500).send("Unable to follow user");    
            });
        }
    });
};

exports.unfollow = (req,res) => {
    const toBeUnfollowedUserId = req.params.userid;
    const currentUserId = req.payload.user._id;

    FollowFollower.findOne({follower:currentUserId,followee:toBeUnfollowedUserId},(err,followfollower)=>{
        if(err)
            res.status(500).send(err);
        else if(!followfollower)
            res.status(403).send("Cannot unfollow a user whom you are not following");
        else if(followfollower) {
            FollowFollower.findOneAndRemove({follower:currentUserId,followee:toBeUnfollowedUserId},function(err){
                if(err) {
                    res.status(500).send(err);
                }
                else {
                    res.send("Successfully unfollowed");
                }
            });
        }    
    })
};

exports.getFollowers = (req,res) => {
    const currentUserId = req.payload.user._id;
    console.log(currentUserId);
    User.aggregate([
        {$match: {_id: ObjectId(currentUserId)}},
        {$unwind: "$followers"},
        {"$group": {"_id": "$_id", "followers": {"$push": "$followers"}}}
    ]).exec(function(err,followers){
          if(!err) {
              res.send(followers);
          }
      });
};