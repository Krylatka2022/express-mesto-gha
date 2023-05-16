/* eslint-disable max-len */
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/notFound-error');
const BadRequestError = require('../errors/badRequest-error');
const ConflictError = require('../errors/conflict-error');

const { NODE_ENV, JWT_SECRET } = process.env;
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(StatusCodes.OK).send({ users }))
    .catch((err) => {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => res.status(200).send({ user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch(next);
};

// Получить данные пользователя по id
const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        // res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь не найден' });
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при поиске пользователя' });
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      return next(err);
    });
};

// const createUser = (req, res, next) => {
//   const {
//     name, about, avatar, email,
//   } = req.body;
//   bcrypt.hash(req.body.password, 10)
//     .then((hash) => {
//       User.create({
//         name, about, avatar, email, password: hash,
//       })
//         .then((user) => res.status(StatusCodes.CREATED).send({ data: user }))
//         .catch((err) => {
//           if (err.name === 'ValidationError') {
//              res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
//           } else if (err.code === 11000) {
//             // res.status(StatusCodes.CONFLICT).send({ message: 'Пользователь с таким email уже зарегистрирован' });
//           }
//         });
//     })
//     .catch(next);
// };

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;

  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User
        .create({
          name, about, avatar, email, password: hash,
        })
        .then((user) => res.status(StatusCodes.CREATED).send({ data: user }))
        .catch((err) => {
          if (err.name === 'ValidationError' || err.name === 'CastError') {
            next(new BadRequestError('Переданы некорректные данные при создании пользователя '));
          } else if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        // return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.status(StatusCodes.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        // return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        // return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.status(StatusCodes.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
        throw new BadRequestError('Переданы некорректные данные при обновлении аватара');
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch(next);
};

// Экспорт модулей
module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateAvatar,
  updateUser,
  login,
  getUserMe,
};
