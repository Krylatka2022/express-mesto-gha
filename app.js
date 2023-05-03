const express = require('express');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const routes = require('./routes/index');

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
const { PORT = 3000 } = process.env;

// подключаем мидлвары, роуты и всё остальное...

app.use((req, res, next) => {
  req.user = {
    _id: '644e581ce2abc84dce828420', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});
app.use(routes);

// app.use('*', (req, res) => {
//   res.status(404).send({ message: 'Page Not Found' });
// });

const handleNotFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send({ message: 'Page Not Found' });
};

app.use('*', handleNotFound);

app.listen(PORT, () => {
  console.log(`app слушает порт: ${PORT}`);
});
