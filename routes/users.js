const userRouters = require('express').Router();
const {
  getUsers, getUserById, updateUser, updateAvatar,
} = require('../controllers/users');

// Роуты пользователя
userRouters.get('/', getUsers);
// userRouters.post('/', createUser);
userRouters.get('/:userId', getUserById);
userRouters.patch('/me', updateUser);
userRouters.patch('/me/avatar', updateAvatar);

module.exports = userRouters;
