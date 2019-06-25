const User = require("../models/user");
const Pin =  require("../models/pin");
const PinFeed =  require("../models/pinfeed");
const Board =  require("../models/board");
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
  const boardId = req.params.boardId;
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
              pin = new Pin({title,description,url,website,tags,createdBy:currentUserId,createdAt:new Date(),boardId});
              
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
                        if(!err) {
                          // res.send("successfully saved the pin in the user database");
                          Board.findOneAndUpdate({_id: boardId,createdBy:currentUserId}, {$push: {pins: savedPin}},function(err,board){
                              if(!err&&board) {
                                res.send("pin saved successfully")
                              }
                              else if(!board) {
                                res.send(400).send("There is no such board associated with this user");
                              }
                              else {
                                res.status(500).send("Unable to save the pin")
                              }
                            
                            }); 
                          }
                        
                          
                        else
                          res.status(500).send("unable to save the user in database");  
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

exports.updatePinDesc = (req,res) => {
  const description = req.body.description;
  const pinId = req.params.pinId;
  console.log(req.params.pinId+" "+req.body.description);

  Pin.findOneAndUpdate({_id:pinId,createdBy:req.payload.user._id},{description},function(err,pin){
    console.log(pin)
    if(err) {
      res.status(500).send("Unable to update the pin");
    }
    else if(!pin) {
      res.status(404).send("No such pin exists associated with this user1");
    }
    else if(pin) {
      res.send("Pin successfully updated")
    }
  })
};

exports.deleteAPin = (req,res) => {
  const pinId = req.params.pinId;
  const currentUserId = req.payload.user._id;

  Pin.findOneAndDelete({_id:ObjectId(pinId),createdBy:currentUserId},function(err,pinn){
    console.log(pinn);
    if(err) {
      res.status(500).send("Unablt to delete the pin");
    }
    // else if(!pin) {
    //   res.status(404).send("No such pin exists associated with this user2");
    // }
    else  {
      User.findOneAndUpdate({_id: currentUserId}, {$pull: {pins: pinId}},function(err,user){
        if(err) {
          res.status(500).send("Unablt to delete the pin");
        }
        // else if(!user) {
        //   res.status(404).send("No such pin exists associated with this user3");
        // }
        else  {
          Board.findOneAndUpdate({_id: pinn.boardId}, {$pull: {pins: pinId}},function(err,board) {
            if(err) {
              res.status(500).send("Unablt to delete the pin");
            }
            // else if(!board) {
            //   res.status(404).send("No such pin exists associated with this user");
            // }
            else {
              PinFeed.deleteMany({pin:pinId},function(err,pinfeed){
                if(err) {
                  res.status(500).send("Unablt to delete the pin");
                }
                // else if(!pinfeed) {
                //   res.status(404).send("No such pin exists associated with this user");
                // }
                else  {
                  res.send("Successfully deleted the pin from the db");
                }
              })
              // res.send("successfully deleted the pin!");
            }
          });
        }
      });
    }
  });
};
        



exports.getPinsFromUserBoards = (req,res) => {
  const currentUserId = req.payload.user._id;
  const pinsPerPage=2;
  const pageToBeRetrieved = req.params.pgno;
  const boardId = req.body.boardId;

  Pin.find({boardId,createdBy:currentUserId})
  .lean(true)
  .limit(pinsPerPage)
  .skip((pageToBeRetrieved-1)*pinsPerPage)
  .sort("pin.createdAt")
  .exec(function(err,pins){
    if(err) {
      res.status(500).send(err);
    }
    if(pins) {
      if(pins.length==0) {
        res.send("No pins")
      }
      else
        res.send(pins);
    }
    if(!pins) {
      res.status(404).send("Cannot find pins associated with the user");
    }
  })
}

exports.getImageFeed = (req,res) => {

  const currentUserId=req.payload.user._id;
  const pinsPerPage=4;

  const pageToBeRetrieved = req.params.pgno;

  PinFeed.find({followedBy:currentUserId})
  .populate("pin","createdAt")
  // select("follopin url")
  .lean(true)
  .limit(pinsPerPage)
  .skip((pageToBeRetrieved-1)*pinsPerPage)
  .sort("pin.createdAt")
  .exec(function(err,pins){
    console.log(pins.length);
    if(!err)
      res.send(pins);
    else if(!pins)
      res.sendStatus(200);
     else
      res.send(404); 
  });
  };
