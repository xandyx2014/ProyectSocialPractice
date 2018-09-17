"use strict";
const express = require('express');
const MessageController = require('../controllers/message.controller');
const app = express.Router();
const authMd = require('../middleware/auth.middleware');




app.get('/pruebaMessage',[authMd.ensureAuth] ,MessageController.probando);
app.post('/message',[authMd.ensureAuth] ,MessageController.saveMessage);
app.get('/myMessages/:page?',[authMd.ensureAuth] ,MessageController.getReceivedMessages);
app.get('/messages/:page?',[authMd.ensureAuth] ,MessageController.getEmmitMessage);
app.get('/unviewedMessages',[authMd.ensureAuth] ,MessageController.getUnviewedMessages);
app.get('/setviewedMessages',[authMd.ensureAuth] ,MessageController.setViewedMessages);


module.exports = app;