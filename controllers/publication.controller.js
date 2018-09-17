"use strict";
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const Publication = require('../model/publication');
const Users = require('../model/usuario');
const Follow = require('../model/follow');

function probando(req, res) {
  res.status(200).json({
    message: 'Hola desde el contradolador de publicaciones'
  })
}
//====================================
// Guardar Publicacion
//====================================
function savePublication(req, res) {
  const params = req.body;

  if (!params.text) {
    return res.status(200).json({
      message: 'Debes enviar un texto'
    });
  }
  let publication = new Publication();
  publication.text = params.text;
  publication.file = 'null';
  publication.user = req.user.sub;
  publication.create_at = moment().unix();
  publication.save((err, publicationBD) => {
    if (err) {
      return res.status(500).json({
        message: 'Error al guardar en la publicacion'
      });
    }
    if (!publicationBD) {
      return res.status(404).json({
        message: 'La publicacion no ha sido guardada'
      });
    }
    return res.status(200).json({
      publication: publicationBD
    });
  });

}
//====================================
// Obtener Todas Publicaciones de los que seguimos
//====================================
function getPublications(req, res) {
  const page = req.params.page || 0;
  const itemPerPage = 4;
  Follow.find({
    'user': req.user.sub
  }).populate('followed').exec((err, followsDB) => {
    if (err) {
      return res.status(500).json({
        message: 'Error al guardar en la publicacion'
      });
    }
    if (!followsDB) {
      return res.status(404).json({
        message: 'los usuario no ha sido encontrado no ha sido guardada'
      });
    }
    let followsClean = [];
    followsDB.forEach((data) => {
      data.followed.password = '...';
      followsClean.push(data.followed);
    });
    Publication.find({
      'user': {
        '$in': followsClean
      }
    }).sort('create_at').skip(page).limit(itemPerPage).populate('user').exec((err, publicationsDB) => {
      if (err) {
        return res.status(500).json({
          message: 'Error en las publicacion'
        });
      }
      if (!publicationsDB) {
        return res.status(404).json({
          message: 'las publicaciones no existen'
        });
      }
      Publication.countDocuments({
        'user': {
          '$in': followsClean
        }
      }).exec((err, countDB) => {
        res.status(200).json({
          total: countDB,
          pages: Math.ceil(countDB / itemPerPage),
          publication: publicationsDB
        });
      });
    });

  });
}
//====================================
// Obtener publicacion por ID
//====================================
function getPublication(req, res) {
  const publicationId = req.params.id;
  Publication.findById(publicationId, (err, publicationDB) => {
    if (err) {
      return res.status(500).json({
        message: 'Error al guardar en la publicacion'
      });
    }
    if (!publicationDB) {
      return res.status(404).json({
        message: 'No existe la publicacion'
      });
    }
    res.status(200).json({
      publication: publicationDB
    });
  });
}
//====================================
// Borrar Publicacion Por ID
//====================================
function deletePublication(req, res) {
  //
  const Eliminado = 0;
  const publicationId = req.params.id;
  Publication.deleteOne({
    user: req.user.sub,
    _id: publicationId
  }).exec((err, publicationBD) => {

    if (err) {
      return res.status(500).json({
        message: 'Error al Borrar la publicacion'
      });
    }
    // n = 1 Se Elimino 
    // n = 0 No se Elimino
    let {
      n: resDB
    } = publicationBD;
    if (resDB === Eliminado) {
      return res.status(404).json({
        message: 'No existe la publicacion'
      });
    }
    res.status(200).json({
      ok: true,
      message: 'La publicacion fue eliminada correctamente',
    });
  })
}
//====================================
// Subir Imagen a la Publicacion
//====================================
function uploadImage(req, res) {
  
  const publicationId = req.params.id;
  
  if (req.files && Object.keys(req.files).length != 0) {
    const filePath = req.files.image.path;
    const filesSplit = filePath.split('\\');
    let fileName = req.files.image.path.split('\\')[2];
    let extension = req.files.image.type.split('/')[1];

    if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {

      Publication.findOne({
        'user': req.user.sub,
        '_id': publicationId
      }).exec((err, publicationDB) => {
        if (publicationDB) {
          Publication.findByIdAndUpdate(publicationId,{file: fileName}, {new: true}).exec((err, publicatioUpdate) => {
            if (err) {
              return res.status(500).json({
                message: 'error en la acutalizacion'
              })
            }
            if (!publicatioUpdate) {
              return res.status(200).json({
                message: 'error al actualizar el usuario'
              });
            }
            res.status(200).json({
              publication: publicatioUpdate
            })
          });
        }
        else {
          return removeFileUpload(res, filePath, 'No tienes permiso para actualizar para actualizar esta imagen');
        }
      });
      // actualizar documento del usuario logueado

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
  const pathFile = './uploads/publications/' + imageFile;

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
module.exports = {
  probando,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getuploadImage
}