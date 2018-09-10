"use strict";
const express = require('express');
const app = express();


app.use(express.urlencoded({extended: true}));
const useRoute = require('./routes/user.route');

app.use('/api',useRoute);







module.exports = app;