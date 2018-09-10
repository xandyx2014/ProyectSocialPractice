"use strict";
const mongose = require('mongoose');
const Schema = mongose.Schema;

const UserSchema = Schema(
  {
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
  }
);
module.exports = mongose.model('User',UserSchema);