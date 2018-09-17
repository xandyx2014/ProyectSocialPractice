"use strict";
const express = require('express');
const UserController = require('../controllers/user.controller');
const app = express.Router();
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});
const authMd = require('../middleware/auth.middleware');

app.get('/home',UserController.home);
app.get('/pruebas',authMd.ensureAuth,UserController.prueba);
app.post('/register',UserController.saveUsers);
app.post('/login',UserController.loginUser);
app.get('/user/:id',authMd.ensureAuth,UserController.getUser);
app.get('/users/:page',authMd.ensureAuth,UserController.getUsers);
app.put('/updateUser/:id',authMd.ensureAuth,UserController.updateUser);
app.post('/uploadImageUser/:id',[md_upload, authMd.ensureAuth],UserController.uploadImage);
app.get('/getImageUser/:imageFile',UserController.getuploadImage);
app.get('/counters/:id',[authMd.ensureAuth],UserController.getCounters);


module.exports = app;