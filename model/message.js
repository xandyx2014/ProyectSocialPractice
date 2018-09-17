"use strict";
const mongose = require('mongoose');
const Schema = mongose.Schema;

const MessageSchema = Schema(
  {
    text: String,
    created_at: String,
    emmitter: {
      type: Schema.Types.ObjectId,
      ref:'User'
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref:'User'
    },
    viewed: String,
    
  }
);
module.exports = mongose.model('Message',MessageSchema);