// This file does entire backEnd handling of the code . 
"use strict";

// declarig and importing node and  express modules for various tasks 
var nodemailer = require('nodemailer');  // module for sending mail
var express = require('express');  // module for express library
var app = express(); 
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID; // module for mongodb
var mongo = require("mongodb"),
    fs = require("fs"),         // to read static files
    http = require("http");
var bodyParser = require("body-parser");  // module for text parsing

app.use(bodyParser());

var mongodbUri = "mongodb://127.0.0.1/chat"; // establing monoDb connection

// setting mail sent transporter
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
            user: 'jainshishir18@gmail.com', // admin email id
            pass: 'StrangeDoctor!' // admin password
  }
});
   
// for handling web page access restrictions done by browser for security     
app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next()
})

// creating server
var server = app.listen(3000, function () {
  var host = server.address().address
  console.log(host)
  var port = server.address().port
  console.log("app listening at http://@%s:%s", host, port);
});

//creating socket for continuos connection 
var io = require('socket.io')(server);

//routing 
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/admin', function(req, res){
    res.sendFile(__dirname + '/admin.html');
});

app.get('/users', function(req, res){
    res.sendFile(__dirname + '/users.html');
});

//for modifying a subscription
app.put('/subscriptionModification', function (req, res) { 
  mongo.MongoClient.connect(mongodbUri, function(err, db) {
  assert.equal(null, err);
  db.collection('users').insertOne( req.body
   , function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
    });
  });
});

//inserts user subscription details in db 
app.post('/subscription', function (req, res) {	
  mongo.MongoClient.connect(mongodbUri, function(err, db) {
  assert.equal(null, err);
  db.collection('users').insertOne( req.body ,
    function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
  	});
  });
});

// MongoDb CLient Connection 
mongo.MongoClient.connect (mongodbUri, function (err, db) {

  db.collection('messages', function(err, collection) {
    // open socket
    io.sockets.on("connection", function (socket) {
      // open a tailable cursor
      console.log("== open tailable cursor");
      collection.find({}, {tailable:true, awaitdata:true, numberOfRetries:-1}).each(function(err, doc) {
        // send message to client
         var x  = doc.type
         var y = doc.text
         var temp = doc

        db.collection('users').find({"subscription":x}).toArray(function(err, docs) {
          docs.forEach(function(doc) {
            console.log(doc.emailId)
            socket.emit("user1",doc);
            var mailOptions = {
              from: 'jainshishir18@gmail.com', // sender address
              to: doc.emailId, // list of receivers 
              subject: 'Email Example', // Subject line
              text: y //, // plaintext body
            };

            transporter.sendMail(mailOptions, function(error, info){
            if(error){
              console.log(error);
              } else{
              console.log('Message sent: ' + info.response);
              };
            });
            
          });
        });

        })
      });
    });
  });
