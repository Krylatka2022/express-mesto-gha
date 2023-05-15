const userRouters = require('express').Router();
const {
  getUsers, getUserById, updateUser, updateAvatar, getUserMe,
} = require('../controllers/users');
const {
  validationUserId,
  validationUpdateUser,
  validationUpdateAvatar,
} = require('../middlewares/validation');

// Роуты пользователя
userRouters.get('/', getUsers);
userRouters.get('/:userId', validationUserId, getUserById);
userRouters.get('/me', getUserMe);
userRouters.patch('/me', validationUpdateUser, updateUser);
userRouters.patch('/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = userRouters;
