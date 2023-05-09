const userRouters = require('express').Router();
const {
  getUsers, getUserById, updateUser, updateAvatar, getUserMe,
} = require('../controllers/users');

// Роуты пользователя
userRouters.get('/', getUsers);
userRouters.get('/:userId', getUserById);
userRouters.get('/me', getUserMe);
userRouters.patch('/me', updateUser);
userRouters.patch('/me/avatar', updateAvatar);

module.exports = userRouters;
