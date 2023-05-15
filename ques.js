// //roter
// cardRouters.post('/', validationCreateCard, createCard);

// // validation
// const validationCreateCard = celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().min(2).max(30).required(),
//     link: Joi.string().required().custom(validationUrl),
//   }),
// });

// const validator = require('validator');

// //schema
// const cardSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     minlength: 2,
//     maxlength: 30,
//   },
//   link: {
//     type: String,
//     required: true,
//     validate: {
//       validator: (v) => validator.isURL(v),
//       message: 'Некорректный URL',
//     },
//   },
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user',
//     required: true,
//   },
//   likes: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user',
//     default: [],
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// //controller
// const createCard = (req, res) => {
//   const { name, link } = req.body;
//   Card.create({ name, link, owner: req.user._id })
//     .then((card) => {
//       Card.findById(card._id)
//         .populate('owner')
//         .populate('likes')
//         .then((cardWithOwnerAndLikes) => {
//           res.status(StatusCodes.CREATED).send({ data: cardWithOwnerAndLikes });
//         });
//     })
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
// eslint-disable-next-line max-len
//         res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
//       } else {
// eslint-disable-next-line max-len
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//       }
//     });
// };

// eslint-disable-next-line max-len
//  Дано 4 файла: router, validation, schema, controller Реализуй так, чтобы при создании карточки с полем name или link не удовлетворяющим условия был ответ 400(сейчас выскакивает ошибка по умолчанию 500) и ошибка отлавливалась при помощи
