const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .populate('likes')
    .then((cards) => res.status(StatusCodes.OK).send({ data: cards }))
    .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
};

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

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(StatusCodes.CREATED).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

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
//         res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
//       } else {
// eslint-disable-next-line max-len
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//       }
//     });
// };

const deleteCardById = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(StatusCodes.OK).send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const likeCard = (req, res) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
    return;
  }
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate('owner')
    .populate('likes')
    .then((card) => {
      if (!card) {
        res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
        return;
      }
      res.status(StatusCodes.OK).send({ data: card });
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

// const likeCard = (req, res, next) => {
//   Card
//     .findByIdAndUpdate(
//       req.params.cardId,
//       { $addToSet: { likes: req.user._id } },
//       { new: true },
//     )
//     .then((card) => {
//       if (!card) {
// eslint-disable-next-line max-len
//         return res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
//       }
//       return res.send({ card, message: 'Лайк успешно поставлен' });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
// eslint-disable-next-line max-len
//         return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
//       }
//       return next(err);
//     });
// };

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
        res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
        return;
      }
      res.status(StatusCodes.OK).send({ data: card });
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

// const dislikeCard = (req, res, next) => {
//   Card
//     .findByIdAndUpdate(
//       req.params.cardId,
//       { $pull: { likes: req.user._id } },
//       { new: true },
//     )
//     .then((card) => {
//       if (!card) {
// eslint-disable-next-line max-len
//         return res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
//       }
//       return res.send({ card, message: 'Лайк успешно удален' });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
// eslint-disable-next-line max-len
//         return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Переданы некорректные данные для снятия лайка' });
//       }
//       return next(err);
//     });
// };

// Экспорт модулей
module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
