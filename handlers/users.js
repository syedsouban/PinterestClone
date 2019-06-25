const User =  require("../models/user");
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
    else {
        User.findById({_id: currentUserId},(err,currentUser)=>{
            if(err)
                res.status(500).send("Error occured while searching for user");
            var alreadyFollowed=false;
            if(currentUser) {
                if(currentUser.following)   
                alreadyFollowed = currentUser.following.some(function (user) {
                    return user.toString()===toBeFollowedUserId;
                });
                if(alreadyFollowed) {
                    res.status(403).send({message:"You are already following that user!"});
                }
                else {
                    currentUser.following.push(toBeFollowedUserId);

                    currentUser.save(function(err){
                        if(!err) {
                            User.findOneAndUpdate({_id: toBeFollowedUserId}, {$push: {followers: currentUserId}},function(err){
                                if(!err)
                                    return res.send({message:"success"});
                            });
                        }
                        else {
                            res.status(500).send({message:"unable to update user data"});
                        }
                    });
                }
            }
            if(!currentUser){
                res.status(404).send("No user found!");
            };
        });
    }
};

exports.unfollow = (req,res) => {
    const toBeUnfollowedUserId = req.params.userid;
    const currentUserId = req.payload.user._id;

    User.findOne({_id:currentUserId,following:toBeUnfollowedUserId},function(err,currentUser){
        if(err)
            return res.status(500).send({message:err.message});
        if(!currentUser)
            return res.status(403).send({message:"Cannot unfollow a user whom you don't follow"});
        if(currentUser) {
            currentUser.following.pull(toBeUnfollowedUserId);
            currentUser.save(function(err){
                if(err)
                    res.status(500).send({message:err.message});
                User.findOneAndUpdate({_id: toBeUnfollowedUserId}, {$pull: {followers: currentUserId}},function(err){
                    if(err)
                        return res.sendStatus(500);
                    else
                        return res.send({message:"success"});    
                });                
            });
        }    
    });
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