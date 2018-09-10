"use strict";
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/usuario');
const jwt = require('../services/jwt.service');

function home( req, res) {
  res.status(200).json(
    {
      message: 'hola mundo'
    }
  );
}

function prueba( req, res) {
  res.status(200).json(
    {
      message: 'accion de prueba'
    }
  );
}

function saveUsers(req, res) {
  const params = req.body;
  const user = new User();
  if (params.name && params.surname && params.nick && params.email && params.password) {

    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    User.findOne({$or:[
      {email: user.email.toLowerCase()},
      {nick: user.nick.toLowerCase()}]},
      ).exec( (err, users) => {
        if (err) {
          res.status(500).json({
            message: 'error al guardad el usuario'
          })
        }
        if (users) {
          res.status(200).json({
            message: 'El usuario ya existe'
          })
          return;
        } else {
          bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            user.save((err, userStored) => {
              if (err) {
                res.status(500).json({
                  message: 'error al guardad el usuario'
                })
              }
              if (userStored) {
                res.status(200).json({
                  user: userStored
                });
              } else {
                res.status(404).json({
                  message: 'No se registrado el usuario'
                });
              }
            });
          });
        }
      });
    
  } else {
    res.status(200).json({
      message: 'Faltan campos para enviar'
    });
  }
}

function loginUser(req, res) {
  const params = req.body;
  const email = params.email;
  const password = params.password;
  User.findOne({email: email}, (err, user) => {
    console.log(user);
    if (err) {
      res.status(500).json({
        message: 'Error en la peticion',
        error: err
      });
      return;
    }
    if (user) {
      bcrypt.compare(password, user.password, (err, check) => {
        if (check) {
          if (params.gettoken) {
            // devolver token
            // generar el token
            return res.status(200).json({
              token: jwt.createToken(user)
            });

          } else {
            // devolver usuario
            user.password = '...';
            res.status(200).json({
              user
            })
          }
          
        } else {
          res.status(500).json({
            message: 'Error el usuario no se apodido indentificar'
          });
          return;
        }
      });
    } else {
      res.status(500).json({
        message: 'Error el usuario no se apodido indentificar!!'
      });
      return;
    }
  });
}

function getUser(req, res) {
  // parametro de la url /user/myparams
  const userId = req.params.id;
  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        message: 'error en la peticion'
      })
    }
    if (!user) {
      return res.status(404).json({
        message: 'usuario no encontrado'
      })
    }
    return res.status(200).json({
      user
    })
  });
}

module.exports = {
  home,
  prueba,
  saveUsers,
  loginUser,
  getUser
}