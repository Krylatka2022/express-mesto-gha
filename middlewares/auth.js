const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.cookies.jwt;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  console.log(payload);

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key');
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }
  req.user = payload;
  return next();
};
