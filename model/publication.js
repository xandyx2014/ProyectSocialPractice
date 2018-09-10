"use strict";
const mongose = require('mongoose');
const Schema = mongose.Schema;

const PublicationSchema = Schema(
  {
    text: String,
    file: String,
    create_at: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
);
module.exports = mongose.model('Publication',PublicationSchema);