// const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Card = require('../models/card');
const BadRequestError = require('../errors/badRequest-error');
const NotFoundError = require('../errors/notFound-error');
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
        throw new BadRequestError('Переданы некорректные данные при создании карточки');
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

// Удаление карточки
function deleteCardById(req, res, next) {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
        throw new NotFoundError('Карточка с указанным _id не найдена');
      } if (req.user._id !== card.owner._id.toString()) {
        // eslint-disable-next-line max-len
        // res.status(StatusCodes.FORBIDDEN).send({ message: 'У вас нет прав на удаление данной карточки' });
        throw new ForbiddenError('У вас нет прав на удаление данной карточки');
      }
      Card.findByIdAndRemove(cardId)
        .then(() => res.send({ message: 'Карточка удалена' }));
    })
    .catch(next);
}

const likeCard = (req, res, next) => {
  Card
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .orFail(() => new NotFoundError('Указанный _id не найден'))
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Карточка с указанным _id не найдена'));
      }
      return res.send({ card, message: 'Лайк успешно поставлен' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else {
        next(err);
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .orFail(() => new NotFoundError('Указанный _id не найден'))
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Карточка с указанным _id не найдена'));
      }
      return res.send({ card, message: 'Лайк успешно удален' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(err);
      }
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
