"use strict";
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/usuario');
const jwt = require('../services/jwt.service');
const fs = require('fs');
const path = require('path')
const Follow = require('../model/follow');
const Publication = require('../model/publication');

function home(req, res) {
  res.status(200).json({
    message: 'hola mundo'
  });
}

function prueba(req, res) {
  res.status(200).json({
    message: 'accion de prueba'
  });
}
//====================================
// Guardar Usuario
//====================================
function saveUsers(req, res) {
  const params = req.body;
  const user = new User();
  if (params.name && params.surname && params.nick && params.email && params.password) {

    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    User.findOne({
      $or: [{
          email: user.email.toLowerCase()
        },
        {
          nick: user.nick.toLowerCase()
        }
      ]
    }, ).exec((err, users) => {
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
  User.findOne({
    email: email
  }, (err, user) => {

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
    user.password = '...';
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
    followThisUser(req.user.sub, userId).then((data) => {
      let [followed, following] = data;
      return res.status(200).json({
        user,
        followed,
        following
      });
    });

  });
}

function getUsers(req, res) {
  const identityUserId = req.user.sub;
  const page = Number(req.params.page) || 0;
  const itemPage = 5;
  User.find().sort('_id').skip(page).limit(itemPage).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        message: 'error en la peticion',
        err
      });
    }
    if (!user) return res.status(404).json({
      message: 'Usuarion no encontrados'
    })
    followUserIds(identityUserId).then( (data) => {
      let [ following, followed ] = data;
      User.countDocuments({}, (err, total) => {
        res.status(200).json({
          user,
          userFollowing: following,
          userFollowMe: followed,
          total,
          page: Math.ceil(total / itemPage)
        })
      });
    })
    
  });
}
const followUserIds = (userId) => {
  const following = new Promise(( resolve, reject ) => {
    Follow.find({ 'user': userId}).select({'_id':0, '__v': 0, 'user': 0}).exec((err, follow) => {
      let followClean = [];
      follow.forEach( ( follow ) => {
        followClean.push(follow.followed);
      })
      resolve(followClean);
    })
  });
  const followed = new Promise(( resolve, reject ) => {
    Follow.find({ 'followed': userId}).select({'_id':0, '__v': 0, 'followed': 0}).exec((err, follow) => {
      let followClean = [];
      follow.forEach( ( follow ) => {
        followClean.push(follow.user);
      })
      resolve(followClean);
    })
  });
  return Promise.all([
    following,
    followed
  ])
}

function updateUser(req, res) {
  // los parametros son /uri/:id
  const userId = req.params.id;
  const update = req.body;
  delete update.password;
  if (userId != req.user.sub) {
    return res.status(500).json({
      message: 'no tienes permisos para actualizar los datos del usuario'
    });
  }
  User.findOneAndUpdate(userId, update, {
    new: true
  }, (err, userUpdate) => {
    if (err) {
      return res.status(500).json({
        message: 'error en la peticion',
        err
      });
    }
    if (!userUpdate) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }
    res.status(200).json({
      user: userUpdate
    });
  });
}
// subir archivo imagen/avatar de ususario
function uploadImage(req, res) {
  const userId = req.params.id;
  console.log(req.files);
  if (req.files && Object.keys(req.files).length !== 0) {

    const filePath = req.files.image.path;
    const filesSplit = filePath.split('\\');
    let fileName = req.files.image.path.split('\\')[2];
    let extension = req.files.image.type.split('/')[1];

    if (userId != req.user.sub) {
      return removeFileUpload(res, filePath, 'no tienes permisos para hacer eso');

    }
    if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
      // actualizar documento del usuario logueado
      User.findByIdAndUpdate(userId, {
        image: fileName
      }, {
        new: true
      }, (err, userUpdate) => {
        if (err) {
          return res.status(500).json({
            message: 'error en la acutalizacion'
          })
        }
        if (!userUpdate) {
          return res.status(200).json({
            message: 'error al actualizar el usuario'
          });
        }
        userUpdate.password = '...';
        res.status(200).json({
          user: userUpdate
        })
      });
    } else {
      // extensiones
      return removeFileUpload(res, filePath, 'no es un archivo');
    }
  } else {

    return res.status(200).json({
      message: 'no se han subido archivos o imagen'
    });
  }
}
const removeFileUpload = (res, filePath, message) => {

  fs.unlink(filePath, (err) => {
    return res.status(200).json({
      message
    })
  });
}

function getuploadImage(req, res) {

  const imageFile = req.params.imageFile;
  const pathFile = './uploads/users/' + imageFile;

  fs.exists(pathFile, (exists) => {
    if (exists) {
      res.sendFile(path.resolve(pathFile));
    } else {
      res.status(200).json({
        message: 'no existe la iamgen'
      })
    }
  })
}

function getCounters(req, res) {
  console.log(req.user);
  let userId = req.user.sub || req.params.id;
  
    getCountFollow(userId).then( (data) => {
      let [following, followed, publication] = data;
      return res.status(200).json({
        following,
        followed,
        publication
      })
    })
  
}
const getCountFollow = (userID) => {
  // Obtiene el contador following
  const following = new Promise( (resolve, reject ) => {
    Follow.count({'user': userID}).exec((err,count) => {
      resolve(count);
    });
  });
  // Obtiene el contador followed
  const followed = new Promise( (resolve, reject ) => {
    Follow.count({'followed': userID}).exec((err,count) => {
      resolve(count);
    });
  });
  // Obtiene el contador publication
  const publication = new Promise((resolve, reject ) => {
    Publication.count({'user': userID}).exec((err,count) => {
      resolve(count);
    });
  })
  return Promise.all([
    following,
    followed,
    publication
  ]);
}
const followThisUser = (identityUserId, userId) => {

  const followingPromise = new Promise((resolve, reject) => {
    Follow.findOne({
      "user": identityUserId,
      "followed": userId
    }).exec((err, folloDB) => {
      resolve(folloDB)
    });
  });

  const followedPromise = new Promise((resolve, reject) => {
    Follow.findOne({
      "user": userId,
      "followed": identityUserId
    }).exec((err, folloDB) => {
      resolve(folloDB)
    });
  });
  return Promise.all([followingPromise, followedPromise]);


}
module.exports = {
  home,
  prueba,
  saveUsers,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage,
  getuploadImage,
  getCounters
}