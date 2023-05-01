const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect('mongodb://localhost:27017/mestodb', {
//   useNewUrlParser: true,
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { PORT = 3000 } = process.env;

// подключаем мидлвары, роуты и всё остальное...

app.use((req, res, next) => {
  req.user = {
    _id: '644e581ce2abc84dce828420', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/', userRoutes);
app.use('/', cardRoutes);

app.use(express.json());
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Page Not Found' });
});

app.listen(PORT, () => {
  console.log(`app слушает порт: ${PORT}`);
});
