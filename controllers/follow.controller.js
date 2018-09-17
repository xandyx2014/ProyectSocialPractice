"use strict";
const path = require('path');
const fs = require('fs');
const mongoosePagina = require('mongoose-pagination');
const User = require('../model/usuario');
const Follow = require('../model/follow');

function prueba(req, res) {
  res.status(200).json({
    message: 'Hola mundo follow controller'
  });
}
//====================================
// Seguir a un Persona
//====================================
function saveFollow(req, res) {
  const paramas = req.body;
  let follow = new Follow()
  follow.user = req.user.sub;
  follow.followed = req.body.followed;
  follow.save((err, followBD) => {
    if (err) {
      res.status(500).json({
        message: 'error al guardar el seguiento'
      })
    }
    if (!followBD) {
      return res.status(404).json({
        message: 'el seguimiento no se ha guardado'
      })
    }
    return res.status(200).json({
      follow: followBD
    })
  });

}
//====================================
// desuscripbirse de un usuario
//====================================
function deleteFollow(req, res) {
  const userId = req.user.sub;
  const followId = req.params.id;
  Follow.findOneAndRemove({
    'user': userId,
    'followed': followId
  }, (err, followBD) => {

    if (err) {
      return res.status(500).json({
        message: 'hubo un error al guardar el usuario'
      });
    }
    if (!followBD) {
      return res.status(404).json({
        message: 'el usuario no fue encontrado'
      });
    }
    return res.status(200).json({
      message: 'el follow fue eliminado',
      followBD
    });

  });
}
//====================================
// obtener todos los comentarios
//====================================
function getFollowingUsers(req, res) {
  let userid = Number(req.user.sub);
  let page = Number(req.params.page) || 0;
  let itemsPerPage = 4;
  if (req.params.id) {
    userid = req.params.id;
  }
  Follow.find({
    'user': userid
  }).skip(page).limit(itemsPerPage).populate('followed').exec((err, followBD) => {
    if (err) {
      return res.status(500).json({
        message: 'hubo un error al guardar el usuario',
        err
      });
    }
    if (!followBD) {
      return res.status(404).json({
        message: 'Los usuarios no fueron encontrado'
      });
    }
    Follow.countDocuments({
      'user': userid
    }, (err, count) => {
      let total = count;
      return res.status(200).json({
        total: count,
        follows: followBD,
        pages: Math.ceil(total / itemsPerPage)
      });
    });

  });

}

function getFollowdUsers(req, res) {
  let userid = Number(req.user.sub);
  let page = Number(req.params.page) || 0;
  let itemsPerPage = 4;
  if (req.params.id) {
    userid = req.params.id;
  }
  Follow.find({
    'followed': userid
  }).skip(page).limit(itemsPerPage).populate('user').exec((err, followBD) => {
    if (err) {
      return res.status(500).json({
        message: 'hubo un error al guardar el usuario',
        err
      });
    }
    if (!followBD) {
      return res.status(404).json({
        message: 'No te sigue ningun usuario'
      });
    }
    Follow.countDocuments({
      'followed': userid
    }, (err, count) => {
      let total = count;
      return res.status(200).json({
        total: count,
        follows: followBD,
        pages: Math.ceil(total / itemsPerPage)
      });
    });

  });
}
//====================================
// Devolver usuarios que sigo
//====================================
function getMyFollows(req, res) {
  const userID = req.user.sub;

  Follow.find({
    user: userID
  }).populate('user followed').exec((err, followsDB) => {
    if (err) {
      return res.status(500).json({
        message: 'hubo un error al guardar el usuario',
        err
      });
    }
    if (!followsDB) {
      return res.status(404).json({
        message: 'No te sigue ningun usuario'
      });
    }
    return res.status(200).json({
      follows: followsDB
    })
  })
}
//====================================
// Devolver usuario que me siguen
//====================================
function getYourFollowsBacks(req, res) {
  const userID = req.user.sub;

  Follow.find({
    user: userID
  }).populate('user followed').exec((err, followsDB) => {
    if (err) {
      return res.status(500).json({
        message: 'hubo un error al guardar el usuario',
        err
      });
    }
    if (!followsDB) {
      return res.status(404).json({
        message: 'No te sigue ningun usuario'
      });
    }
    return res.status(200).json({
      follows: followsDB
    })
  })
}

module.exports = {
  prueba,
  saveFollow,
  deleteFollow,
  getFollowingUsers,
  getFollowdUsers,
  getMyFollows,
  getYourFollowsBacks
}