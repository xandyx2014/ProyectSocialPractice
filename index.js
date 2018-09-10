"use strict"
const app = require('./app');
app.set('port',3000);
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/websocial',{
  useNewUrlParser: true
}).then( () => {
  app.listen(process.env.PORT || app.get('port'), () => {
    console.log('Conecction correcta');
  });
});
