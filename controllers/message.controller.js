"use strict";
const moment = require('moment');
const fs = require('fs');
const mongoosePagina = require('mongoose-pagination');
const User = require('../model/usuario');
const Follow = require('../model/follow');
const Message = require('../model/message');

function probando(req, res) {
  res.status(200).json({
    message: 'Hola que tal desde MessageController'
  });
}
//====================================
// Enviar Mensajes
//====================================
function saveMessage(req, res) {
  const params = req.body;

  if (!params.text && !params.receiver) {
    res.status(200).json({
      message: 'Envia Los Datos Necesarios'
    });
  }
  const message = new Message();
  message.emmitter = req.user.sub;
  message.receiver = params.receiver;
  message.text = params.text;
  message.created_at = moment().unix();
  message.viewed = 'false';
  message.save((err, messageBD) => {
    if (err) {
      res.status(500).json({
        message: 'Error en la peticion',
        err
      });
    }
    if (!messageBD) {
      res.status(500).json({
        message: 'Error al enviar el mensaje'
      });
    }
    return res.status(200).send(
      {
        message: messageBD
      }
    );
  });
}
function getReceivedMessages(req, res) {
  const userId = req.user.sub;
  const page = Number(req.params.page) || 0;
  const itemPerPage = 4;
  Message.find({receiver: userId}).skip(page).limit(itemPerPage).populate('emmitter','name surname _id nick image').exec((err, messageBD) => {
    if (err) {
      res.status(500).json({
        message: 'Error en la peticion',
        err
      });
    }
    if (!messageBD) {
      res.status(500).json({
        message: 'Error al buscar los mensajes mensaje'
      });
    }
    Message.countDocuments({receiver: userId}).exec((err ,count) => {
      return res.status(200).send(
        {
          total: count,
          messages: messageBD,
          pages: Math.ceil(count/itemPerPage)
        }
      );
    })
    
  });
}
function getEmmitMessage(req, res) {
  const userId = req.user.sub;
  const page = Number(req.params.page) || 0;
  const itemPerPage = 4;
  Message.find({emmitter: userId}).skip(page).limit(itemPerPage).populate('emmitter receiver','name surname _id nick image').exec((err, messageBD) => {
    if (err) {
      res.status(500).json({
        message: 'Error en la peticion',
        err
      });
    }
    if (!messageBD) {
      res.status(500).json({
        message: 'Error al buscar los mensajes mensaje'
      });
    }
    Message.countDocuments({receiver: userId}).exec((err ,count) => {
      return res.status(200).send(
        {
          total: count,
          messages: messageBD,
          pages: Math.ceil(count/itemPerPage)
        }
      );
    });
    
  });
}
function getUnviewedMessages(req, res) {
  const userId = req.user.sub;
  Message.countDocuments({receiver: userId, viewed: 'false'}).exec((err ,count) => {
    if (err) {
      return res.status(500).json({
        message: 'Error en la peticion',
        err
      });
    }
    
    return res.status(200).send(
      {
        unviewed: count
      }
    );
  });
}
function setViewedMessages(req, res) {
  const userID = req.user.sub;
  Message.updateMany({receiver: userID, viewed: 'false'},{viewed: 'true'}).exec((err, messageDB) => {
    if (err) {

      return res.status(500).json({
        message: 'Error en la peticion',
        err
      });
    }
    if (!messageDB) {
      return res.status(500).json({
        message: 'Error al buscar los mensajes no leidos'
      });
    }
    return res.status(200).json({
      message: messageDB
    });
  });
}


module.exports = {
  probando,
  saveMessage,
  getReceivedMessages,
  getEmmitMessage,
  getUnviewedMessages,
  setViewedMessages
};