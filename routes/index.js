const express = require('express');

const router = express.Router();
// const NOT_FOUND = require('http-errors');

const userRoutes = require('./users');
const cardRoutes = require('./cards');
const auth = require('../middlewares/auth');

router.use('/users', auth, userRoutes);
router.use('/cards', auth, cardRoutes);

// router.use('*', auth, () => {
//   throw new NOT_FOUND('Запрашиваемый ресурс не найден');
// });

module.exports = router;
