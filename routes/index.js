const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const auth = require('../middlewares/auth');
const { validationSignIn, validationSignUp } = require('../middlewares/validation');
const { createUser, login } = require('../controllers/users');

router.use('/users', auth, userRoutes);
router.use('/cards', auth, cardRoutes);
router.post('/signup', validationSignUp, createUser);
router.post('/signin', validationSignIn, login);

module.exports = router;
