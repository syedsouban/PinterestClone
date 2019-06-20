const User = require("../models/user");
const Pin =  require("../models/pin");
const PinFeed =  require("../models/pinfeed");
const mime = require("mime");
const multer = require("multer");
const fs = require("fs");
const crypto = require('crypto');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    // console.log(file);
    req.file=file;
      cb(null, 'uploads/');  
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname+'.'+mime.extension(file.mimetype));
  }
});

const anymulterupload = multer({ storage: storage }).any();

exports.uploadPin = async (req, res) => {

  anymulterupload(req,res,async function(err){
    if(err)
      res.status(500).send("Unable to upload image");
    
      else {
      var AWS = require('aws-sdk');

      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      
      s3 = new AWS.S3({apiVersion: '2006-03-01'});

      var uploadParams = {Bucket: 'pinterestclone890', Key: '', Body: ''};
      var file = 'uploads/'+req.file.fieldname+'.'+mime.extension(req.file.mimetype);
      var fs = require('fs');
      var fileStream = fs.createReadStream(file);
      fileStream.on('error', function(err) {
          console.log('File Error', err);
      });
      uploadParams.Body = fileStream;
      var path = require('path');

      crypto.pseudoRandomBytes(16, function (err, raw) {
        if(!err&&raw){
          uploadParams.Key = raw.toString('hex') + Date.now() + '.' + mime.extension(req.file.mimetype);
          s3.upload (uploadParams, async function (err, data) {
            if (err) {
              console.log("Error", err);
            }
            if (data) {
              console.log("Upload Success", data.Location);
              const vision = require('@google-cloud/vision');
              const client = new vision.ImageAnnotatorClient();
              const fileName = 'uploads/'+req.file.fieldname+'.'+mime.extension(req.file.mimetype);
              const [result] = await client.labelDetection(fileName);
              const labels = result.labelAnnotations;
              console.log('Labels:');
              var tags = new Array();
              // tags=['anime','fiction','drawing'];
              
              labels.forEach(label => (tags.push(label.description)));
              
              console.log(req.body);

              const title = req.body.title;
              const description = req.body.description;
              const url = data.Location;
              const website = req.body.website;
              const currentUserId = req.payload.user._id;
              pin = new Pin({title,description,url,website,tags,createdBy:currentUserId,createdAt:new Date()});
              
              pin.save(function(err,savedPin){
                if(savedPin) {
                  // res.send("successfully saved pin");
                  // const pin = new Pin({title,description,website,url});
                  // res.send(savedPin);      
                  User.findOneAndUpdate({_id: currentUserId}, {$push: {pins: savedPin}},function(err,user){
                    if(err) {
                      res.sendStatus(500);
                    }
                    if(user) {
                      // res.send(user.followers);
                      var pinFeedArr = [];
                      user.followers.forEach(function(follower) {
                        pinFeedArr.push({"followedBy":ObjectId(follower),"pin":ObjectId(savedPin._id),"url":savedPin.url});
                      });
                      PinFeed.insertMany(pinFeedArr,function(err,pins){
                        if(!err)
                          res.send("successfully saved the pin in the user database");
                        else
                          res.send("unable to save the user in database");  
                      });
                    }     
                  });
                }
                else if(!savedPin) {
                  res.status(500).send("unable to save pin");
                }
                else if(err) {
                  res.status(500).send("error: "+err);
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.getImageFeed = (req,res) => {

  const currentUserId=req.payload.user._id;

  PinFeed.find({followedBy:currentUserId})
  // select("follopin url")
  .lean(true)
  .exec(function(err,pins){
    console.log(pins.length);
    if(!err)
      res.send(pins);
    else if(!pins)
      res.sendStatus(200);
     else
      res.send(404); 
  });

  // User.aggregate([
  //   {$match: { "_id": ObjectId(currentUserId) }}
    
  //   ,{$unwind: "$following"}
  //   ,{$unwind:"$following.$pins"} 
  // ],function(err,re){
  //   if(!err)
  //     res.send(re);
  // });
//   var sum=0;
//   User.find({},function(err,users){
  
//   users.forEach(function(user){
//     User.find({"followers" : {"$in" : [user._id]}}).exec(async function(err,r){
      
//       var ids = r.map(function(el) { return el._id} );
//       console.log(ids);
//       await Pin.find({ "createdBy": { "$in": ids } }).exec(function(err,items) {
//               // res.send(items);
//               sum=sum+items.length;
//               console.log("Sum of pins: "+sum);
               
//       })
//       // res.send(sum);
//     });
//   })
// })
  

//   User.find({},  
//     { _id:currentUserId,
//        "followers" : 
//         { $elemMatch : 
//            { "_id" : currentUserId.toString()
//            } 
//         } 
//     } 
// ).exec(function(err,following){
//   res.send(following);
// });

//   User.find({"followers": currentUserId}).exec(function(err,results) {

//     // Just get array of _id values
//     var ids = results.map(function(el) { return el._id} );

//     // Not sure if you really mean both collections have the same primary key
//     // I'm presuming two different fields being "id" as opposed to "_id"
//     User.find({ "_id": { "$in": ids } },function(err,items) {
//       res.send(items); 
//     })

// })



  

  // User.findById(currentUserId)
  //   .populate("following","pins").limit(2)
  //   .populate("following.pins","_id title")
  //   .exec(function(err,users){
  //     res.send(users);
  //   });






  // User.findById(currentUserId)
  // .populate("followers","pins").exec(function(err,user){
  //   resArr=new Array();
  //   if(!err)
  //   {
  //     console.log(user.followers);
  //     user.followers.forEach(follower => {
  //       follower.pins.forEach(pin => {
  //         resArr.push({followerId:follower._id,pin});
  //       });
  //     });
  //   }
  //     res.send(resArr);
  // });
};