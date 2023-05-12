/* eslint-disable max-len */
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(StatusCodes.OK).send({ users }))
    .catch((err) => {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

// const getUserMe = (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       console.log(user);
//       if (!user) {
//         return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
//       }
//       return res.status(StatusCodes.OK).send({ user });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
//       }
//       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//     });
// };
const getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .select('-password') // исключаем поле password из ответа
    .then((user) => {
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(StatusCodes.OK).json({ user });
    })
    .catch(next);
};
// if (err.name === 'CastError') {
//   return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании пользователя' });
// }
// eslint-disable-next-line implicit-arrow-linebreak
//         return res.status(StatusCodes.NOT_FOUND).json({ message: 'Пользователь с указанным _id не найден.' });
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'На сервере произошла ошибка' }));
// };

// function getUserById(req, res, next) {
//   User.findById(req.params.userId)
//     .then((user) => {
//       if (!user) {
//         return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
//       }
//       res.status(StatusCodes.OK).send({ user });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
//       }
//       next(err);
//       // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//     });
// }

// Получить данные пользователя по id
const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь не найден' });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при поиске пользователя' });
      }
      return next(err);
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.status(StatusCodes.CREATED).send({ data: user }))
        .catch((err) => {
          if (err.name === 'CastError' || err.name === 'ValidationError') {
            return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
          } if (err.code === 11000) {
            return res.status(StatusCodes.CONFLICT).send({ message: 'Пользователь с таким email уже зарегистрирован' });
          }
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
        });
    });
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(StatusCodes.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(StatusCodes.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User
    .findUserByCredentials(email, password)
    .then((user) => {
      console.log(user);
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: true,
        });
      return res.send({ token });
    })
    .catch(next);
};
// const login = (req, res) => {
//   const { email, password } = req.body;

//   User.findOne({ email }).select('+password')
//     // eslint-disable-next-line consistent-return
//     .then((user) => {
//       if (!user) {
//         return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Неправильные почта или пароль' });
//       }

//       bcrypt.compare(password, user.password)
//         // eslint-disable-next-line consistent-return
//         .then((matched) => {
//           if (!matched) {
//             return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Неправильные почта или пароль' });
//           }

//           const token = jwt.sign(
//             { _id: user._id },
//             NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
//             { expiresIn: '7d' },
//           );

//           res.send({ token });
//         })
//         .catch((err) => {
//           console.log(err);
//           res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//     });
// };
/* .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Ошибка авторизации' });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
}; */

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
