const express = require('express');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { validationSignIn, validationSignUp } = require('./middlewares/validation');
// const NotFoundError = require('./errors/notFound-error');

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  // suseUnifiedTopology: true,
});

app.use(express.json());
app.use(cookieParser());
const { PORT = 3000 } = process.env;

// подключаем мидлвары, роуты и всё остальное...

app.post('/signup', validationSignUp, createUser);
app.post('/signin', validationSignIn, login);

app.use(auth);

app.use(routes);

app.use(errors());

const handleNotFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send({ message: 'Page Not Found' });
  // throw new NotFoundError({ message: 'Запрашиваемый ресурс не найден' });
};

app.use(errorHandler);

app.use('*', handleNotFound);

app.listen(PORT, () => {
  console.log(`app слушает порт: ${PORT}`);
});
