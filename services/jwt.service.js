const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'mi_clave_secreta';
const createToken = (user) => {
  const payload = {
    sub: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, 'days')
  };
  return jwt.encode(payload, secret);
}
module.exports = {
  createToken,
  secret
};