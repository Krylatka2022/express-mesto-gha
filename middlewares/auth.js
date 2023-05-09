const jwt = require('jsonwebtoken');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const { NODE_ENV, JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: ReasonPhrases.UNAUTHORIZED });
  }
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key');
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: ReasonPhrases.UNAUTHORIZED });
  }
  req.user = payload;
  return next();
};

module.exports = auth;
