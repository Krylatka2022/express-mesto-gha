const cardRouters = require('express').Router();
const {
  getCards,
  deleteCardById,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

// Роуты карточек
cardRouters.get('/', getCards);
cardRouters.delete('/:cardId', deleteCardById);
cardRouters.post('/', createCard);
cardRouters.put('/:cardId/likes', likeCard);
cardRouters.delete('/:cardId/likes', dislikeCard);

module.exports = cardRouters;
