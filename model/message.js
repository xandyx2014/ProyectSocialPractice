"use strict";
const mongose = require('mongoose');
const Schema = mongose.Schema;

const MessageSchema = Schema(
  {
    text: String,
    createdAt: String,
    emmitter: {
      type: Schema.Types.ObjectId,
      ref:'User'
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref:'User'
    }
    
  }
);
module.exports = mongose.model('Message',MessageSchema);