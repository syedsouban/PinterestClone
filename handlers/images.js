const User = require("../models/user");
const Pin =  require("../models/pin");
const mime = require("mime");
const multer = require("multer");
const fs = require("fs");
const crypto = require('crypto');

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
              pin = new Pin({title,description,url,website,tags,createdBy:currentUserId});
              
              pin.save(function(err,savedPin){
                if(savedPin) {
                  // res.send("successfully saved pin");
                  // const pin = new Pin({title,description,website,url});
                        
                          User.findOneAndUpdate({_id: currentUserId}, {$push: {pins: savedPin}},function(err,user){
                            if(err) {
                                res.sendStatus(500);
                    }
                    if(user) {
                      res.send("successfully saved pin to user");
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

  User.findById(currentUserId)
    .slice("followers",1)
    .slice("followers.pins",[1,1])
    .populate("followers","pins")
    .populate("followers.pins","_id title")
    
    .exec(function(err,users){
      res.send(users);
    });






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