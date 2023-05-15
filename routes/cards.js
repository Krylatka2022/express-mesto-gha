const cardRouters = require('express').Router();

const {
  getCards,
  deleteCardById,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  validationCreateCard,
  validationCardId,
} = require('../middlewares/validation');

// Роуты карточек
cardRouters.get('/', getCards);
cardRouters.delete('/:cardId', validationCardId, deleteCardById);
cardRouters.post('/', validationCreateCard, createCard);
cardRouters.put('/:cardId/likes', validationCardId, likeCard);
cardRouters.delete('/:cardId/likes', validationCardId, dislikeCard);

module.exports = cardRouters;
