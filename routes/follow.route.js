"use strict";
const express = require('express');
const FollowController = require('../controllers/follow.controller');
const app = express.Router();
const authMd = require('../middleware/auth.middleware');

app.get('/pruebaFollow', FollowController.prueba);
app.post('/follow',[authMd.ensureAuth] ,FollowController.saveFollow);
app.delete('/follow/:id',[authMd.ensureAuth] ,FollowController.deleteFollow);
app.get('/following/:id?/:page?',[authMd.ensureAuth] ,FollowController.getFollowingUsers);
app.get('/followed/:id?/:page?',[authMd.ensureAuth] ,FollowController.getFollowdUsers);
app.get('/getMyfollows/:followed?',[authMd.ensureAuth] ,FollowController.getMyFollows);



module.exports = app;