"use strict";
const express = require('express');
const PublicationController = require('../controllers/publication.controller');
const app = express();
const mdAuth = require('../middleware/auth.middleware');
const multipart = require('connect-multiparty');

const mdUpload = multipart({
  uploadDir: './uploads/publications'
});
app.get('/probando', [mdAuth.ensureAuth], PublicationController.probando);
app.post('/publication', [mdAuth.ensureAuth], PublicationController.savePublication);
app.get('/publications/:page?', [mdAuth.ensureAuth], PublicationController.getPublications);
app.get('/publication/:id?', [mdAuth.ensureAuth], PublicationController.getPublication);
app.delete('/publication/:id?', [mdAuth.ensureAuth], PublicationController.deletePublication);
app.post('/uploadImage/:id', [mdAuth.ensureAuth, mdUpload], PublicationController.uploadImage);
app.get('/getImage/:imageFile', [mdAuth.ensureAuth], PublicationController.getuploadImage);

module.exports = app;