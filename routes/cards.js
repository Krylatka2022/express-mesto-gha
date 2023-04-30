const cardRouters = require('express').Router();
const {
  getCards,
  deleteCardById,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

// Роуты карточек
cardRouters.get('/cards', getCards);
cardRouters.delete('/cards/:cardId', deleteCardById);
cardRouters.post('/cards', createCard);
cardRouters.put('/cards/:cardId/likes', likeCard);
cardRouters.delete('/cards/:cardId/likes', dislikeCard);

module.exports = cardRouters;
