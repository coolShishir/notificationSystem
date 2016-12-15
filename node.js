"use strict";

var nodemailer = require('nodemailer');
var express = require('express');
var app = express();
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongo = require("mongodb"),
    fs = require("fs"),         // to read static files
    http = require("http");
var bodyParser = require("body-parser");

app.use(bodyParser());

var mongodbUri = "mongodb://127.0.0.1/chat";

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
            user: 'jainshishir18@gmail.com', // admin email id
            pass: '*******' // admin password
  }
});
   
app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next()
})

var server = app.listen(3000, function () {
  var host = server.address().address
  console.log(host)
  var port = server.address().port
  console.log("app listening at http://@%s:%s", host, port);
});
var io = require('socket.io')(server);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/admin', function(req, res){
    res.sendFile(__dirname + '/admin.html');
});

app.get('/users', function(req, res){
    res.sendFile(__dirname + '/users.html');
});

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

app.post('/dbUpdate', function (req, res) { 
  mongo.MongoClient.connect(mongodbUri, function(err, db) {
  assert.equal(null, err);
  db.collection('messages').insertOne( req.body ,
    function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
    });
  });
});

mongo.MongoClient.connect (mongodbUri, function (err, db) {

  var userIdList = {}
  var collection = db.collection('users')
  var userList  = collection.find( {} ).each(function(err, doc) {
   if ( doc != null ) {
    console.log(doc.emailId)
    }
  })

  db.collection('messages', function(err, collection) {
    // open socket
    io.sockets.on("connection", function (socket) {
      // open a tailable cursor
      console.log("== open tailable cursor");
      collection.find({}, {tailable:true, awaitdata:true, numberOfRetries:-1}).each(function(err, doc) {
        // send message to client
        if (doc.type == "message1" || doc.type == "message3"  ) {
          socket.emit("user1",doc);
          var text = "temp";
          var mailOptions = {
            from: 'jainshishir18@gmail.com', // sender address
            to: 'rit2012058@iiita.ac.in', // list of receivers 
            subject: 'Email Example', // Subject line
            text: text //, // plaintext body
          };

          transporter.sendMail(mailOptions, function(error, info){
          if(error){
            console.log(error);
            } else{
            console.log('Message sent: ' + info.response);
            };
          });
        }
        
        if (doc.type == 'message2') {
          socket.emit("user2",doc);
          var text = "temp";
            
            var mailOptions = {
              from: 'jainshishir18@gmail.com', // sender address
              to: 'shishir.j@quantinsti.com', // list of receivers
              subject: 'Email Example', // Subject line
              text: text //, // plaintext body
            };
          
          transporter.sendMail(mailOptions, function(error, info){
          
            if(error){
              console.log(error);
             } else{
              console.log('Message sent: ' + info.response);
            };
          });
        }
      });
    });
  });
});
