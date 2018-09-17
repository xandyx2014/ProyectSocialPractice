"use strict";
const express = require('express');
const app = express();


app.use(express.urlencoded({extended: true}));
//====================================
// CORS
//====================================
app.use(function(req, res, next) {
 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  next();
});

const useRoute = require('./routes/user.route');
const followRoute = require('./routes/follow.route');
const PublicationRoute = require('./routes/publication.route');
const MessageRoute = require('./routes/message.route');

app.use('/api',useRoute);
app.use('/api',followRoute);
app.use('/api',PublicationRoute);
app.use('/api',MessageRoute);







module.exports = app;