const express = require('express');
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const {
  getChats,
  createChat,
  getChat,
  updateChat,
  deleteChat,
  leaveGroupChat,
  getChatMessages,
  createMessage,
  getMessage,
  updateMessage,
  deleteMessage,
} = require("../controllers/chatsController");

router.route('/')
  .get(
    verifyJWT,
    getChats
  )
  .post(
    verifyJWT,
    createChat
  );

router.route('/:chatId')
  .get(
    verifyJWT,
    getChat
  )
  .patch(
    verifyJWT,
    updateChat
  )
  .delete(
    verifyJWT,
    deleteChat
  );

router.route('/:chatId/users').delete(verifyJWT, leaveGroupChat);

router.route('/:chatId/messages')
  .get(
    verifyJWT,
    getChatMessages
  )
  .post(
    verifyJWT,
    createMessage
  );

router.route('/:chatId/messages/:messageId')
  .get(
    verifyJWT,
    getMessage
  )
  .patch(
    verifyJWT,
    updateMessage
  )
  .delete(
    verifyJWT,
    deleteMessage
  );

module.exports = router;