"use strict";
const mongose = require('mongoose');
const Schema = mongose.Schema;

const FollowSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    followed: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
    
  }
);
module.exports = mongose.model('Follow',FollowSchema);