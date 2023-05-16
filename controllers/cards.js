const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Card = require('../models/card');
const BadRequest = require('../errors/badRequest-error');
const NotFound = require('../errors/notFound-error');
const ForbiddenError = require('../errors/forbidden-error');

const getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .populate('likes')
    .then((cards) => res.status(StatusCodes.OK).send({ data: cards }))
    .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(StatusCodes.CREATED).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
        throw new BadRequest('Переданы некорректные данные при создании карточки');
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

// const deleteCardById = (req, res) => {
//   const { cardId } = req.params;
//   Card.findByIdAndRemove(cardId)
//     .then((card) => {
//       if (!card) {
// eslint-disable-next-line max-len
//         return res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
//       }
//       return res.status(StatusCodes.OK).send({ message: 'Карточка удалена' });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
//       } else {
// eslint-disable-next-line max-len
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//       }
//     });
// };

// Удаление карточки
function deleteCardById(req, res, next) {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
        throw new NotFound('Карточка с указанным _id не найдена');
      } if (req.user._id !== card.owner._id.toString()) {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.FORBIDDEN).send({ message: 'У вас нет прав на удаление данной карточки' });
        throw new ForbiddenError('У вас нет прав на удаление данной карточки');
      }
      Card.findByIdAndRemove(cardId)
        .then(() => res.send({ message: 'Карточка удалена' }));
    })
    // .catch((err) => {
    //   // if (err.name === 'CastError') {
    // eslint-disable-next-line max-len, max-len, max-len
    // res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при удалении карточки' });
    // }
    //  next(err);
    .catch(next);
}

// deleteCardById = (req, res, next) => {
//   const { cardId } = req.params;

//   Card
//     .findById(cardId)
//     .then((card) => {
//       if (!card) {
//         return next(new NotFoundError('Карточка с указанным _id не найдена'));
//       }
//       if (!card.owner.equals(req.user._id)) {
//         return next(new ForbiddenError('Попытка удалить чужую карточку'));
//       }
//       return card.remove().then(() => res.send({ message: 'Карточка успешно удалена' }));
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         next(new BadRequestError('Переданы некорректные данные'));
//       } else {
//         next(err);
//       }
//     });
// };
const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    // eslint-disable-next-line max-len
    // res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
    next(new BadRequest('Переданы некорректные данные для постановки лайка'));
  }
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate('owner')
    .populate('likes')
    .then((card) => {
      if (!card) {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
        throw new NotFound('Карточка с указанным _id не найдена');
      }
      res.status(StatusCodes.OK).send({ data: card });
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const dislikeCard = (req, res) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    res.status().send({ message: 'Переданы некорректные данные для снятия лайка' });
  }
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate('owner')
    .populate('likes')
    .then((card) => {
      if (!card) {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
        // return;
        throw new NotFound('Карточка с указанным _id не найдена');
      }
      res.status(StatusCodes.OK).send({ data: card });
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

// Экспорт модулей
module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
