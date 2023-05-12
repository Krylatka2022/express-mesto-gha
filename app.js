const express = require('express');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(cookieParser());
const { PORT = 3000 } = process.env;

// подключаем мидлвары, роуты и всё остальное...
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(/https?:\/\/(www)?[0-9a-z\-._~:/?#[\]@!$&'()*+,;=]+#?$/im),
    }),
  }),
  createUser,
);

// app.use((req, res, next) => {
//   if (req.path === '/signin' || req.path === '/signup') {
//     next();
//   } else {
//     auth(req, res, next);
//   }
// });

// app.use((req, res, next) => {
//   if (req.path === '/signin' || req.path === '/signup') {
//     return next();
//   }
//   return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Необходима авторизация' });
// });

app.use(errors());
app.use(auth);

app.use(routes);

const handleNotFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send({ message: 'Page Not Found' });
};

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'Ошибка по умолчанию' : message });
  next();
});

app.use('*', handleNotFound);

app.listen(PORT, () => {
  console.log(`app слушает порт: ${PORT}`);
});
