const { StatusCodes } = require('http-status-codes');

const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(StatusCodes.OK).send({ users }))
    .catch((err) => {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(StatusCodes.OK).send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(StatusCodes.CREATED).send({ data: user }))
    .catch(() => res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' }));
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.status(StatusCodes.OK).send({ data: user });
    })
    .catch(() => res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' }));
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
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

// Экспорт модулей
module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateAvatar,
  updateUser,
};
