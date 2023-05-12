const userRouters = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateUser, updateAvatar, getUserMe,
} = require('../controllers/users');

// Роуты пользователя
userRouters.get('/', getUsers);
userRouters.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
}), getUserById);
userRouters.get('/me', getUserMe);
userRouters.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);
userRouters.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,}\.[a-z]{1,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/gim),
  }),
}), updateAvatar);

module.exports = userRouters;
