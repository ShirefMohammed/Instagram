const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");
const asyncHandler = require("../middleware/asyncHandler");
const httpStatusText = require("../utils/httpStatusText");
const createImagesUrl = require("../utils/createImagesUrl");
const sendResponse = require("../utils/sendResponse");
const ROLES_LIST = require("../utils/roles_list");

const getChats = asyncHandler(
  async (req, res) => {
    const chats = await ChatModel.find({
      users: { $elemMatch: { $eq: req.userInfo.userId } }
    })
      .populate({
        path: "users",
        select: "_id name email avatar roles"
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "_id name email avatar roles"
        }
      })
      .populate({
        path: "groupAdmin",
        select: "_id name email avatar roles"
      })
      .sort({ updatedAt: -1 });

    // Handle images url
    chats.map((chat) => {
      chat.users.map((user) => {
        user.avatar = createImagesUrl([user.avatar])[0];
      });

      if (chat?.latestMessage) {
        chat.latestMessage.sender.avatar = createImagesUrl([chat.latestMessage.sender.avatar])[0];
      }

      if (chat?.isGroupChat) {
        chat.groupAdmin.avatar = createImagesUrl([chat.groupAdmin.avatar])[0];
      }
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching chats",
      chats
    );
  }
);

const createChat = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const { users, isGroupChat, groupName } = req.body;

    // Check if chat creator is existed in db
    const IsUserExist = await UserModel.exists({ _id: userId });
    if (!IsUserExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, "User is not found", null);
    }

    users.unshift(userId);

    if (users) {
      if (users.length < 2) {
        return sendResponse(res, 400, httpStatusText.FAIL, "Chat users must be at least 2", null);
      }

      if (!isGroupChat && users.length > 2) {
        return sendResponse(res, 400, httpStatusText.FAIL, "Chat users must be at most 2", null);
      }
    }

    if (isGroupChat && !groupName) {
      return sendResponse(res, 400, httpStatusText.FAIL, "Group name is required", null);
    }

    // Check for non-group chat if chat created before
    // If it exists it will be returned and send to the client
    // If it does not exist new chat will be created and sent to the client
    if (!isGroupChat) {
      const isChatExist = await ChatModel.findOne({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: users[0] } } },
          { users: { $elemMatch: { $eq: users[1] } } },
        ],
      })
        .populate({
          path: "users",
          select: "_id name email avatar roles"
        })
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "_id name email avatar roles"
          }
        });

      if (isChatExist) {
        isChatExist.users.map((user) => {
          user.avatar = createImagesUrl([user.avatar])[0];
        });

        if (isChatExist?.latestMessage) {
          isChatExist.latestMessage.sender.avatar = createImagesUrl([isChatExist.latestMessage.sender.avatar])[0];
        }

        return sendResponse(
          res,
          200,
          httpStatusText.SUCCESS,
          "Chat already exists",
          isChatExist
        );
      }
    }

    let newChat;

    if (isGroupChat) {
      newChat = await ChatModel.create({
        users: users,
        latestMessage: null,
        isGroupChat: isGroupChat,
        groupName: groupName,
        groupAdmin: userId,
      });
    } else {
      newChat = await ChatModel.create({
        users: users,
        latestMessage: null,
      });
    }

    await newChat.populate({
      path: "users",
      select: "_id name email avatar roles"
    });

    await newChat.populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "_id name email avatar roles"
      }
    });

    await newChat.populate({
      path: "groupAdmin",
      select: "_id name email avatar roles"
    });

    newChat.users.map((user) => {
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    if (newChat?.latestMessage) {
      newChat.latestMessage.sender.avatar = createImagesUrl([newChat.latestMessage.sender.avatar])[0];
    }

    if (newChat?.groupAdmin) {
      newChat.groupAdmin.avatar = createImagesUrl([newChat.groupAdmin.avatar])[0];
    }

    sendResponse(
      res,
      201,
      httpStatusText.SUCCESS,
      "Chat is created",
      newChat
    );
  }
);

const getChat = asyncHandler(
  async (req, res) => {
    const chat = await ChatModel.findById(req.params.chatId)
      .populate({
        path: "users",
        select: "_id name email avatar roles"
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "_id name email avatar roles"
        }
      })
      .populate({
        path: "groupAdmin",
        select: "_id name email avatar roles"
      });

    if (!chat) {
      return sendResponse(res, 404, httpStatusText.FAIL, "chat is not found", null);
    }

    if (!chat.users.some((user) => user._id == req.userInfo.userId)) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    chat.users.map((user) => {
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    if (chat?.latestMessage) {
      chat.latestMessage.sender.avatar = createImagesUrl([chat.latestMessage.sender.avatar])[0];
    }

    if (chat?.groupAdmin) {
      chat.groupAdmin.avatar = createImagesUrl([chat.groupAdmin.avatar])[0];
    }

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching chat",
      chat
    );
  }
);

const updateChat = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const { users, isGroupChat, groupName } = req.body;

    // Handle new users conditions
    if (users) {
      if (users.length < 2) {
        return sendResponse(res, 400, httpStatusText.FAIL, "Chat users must be at least 2", null);
      }

      if (!isGroupChat && users.length > 2) {
        return sendResponse(res, 400, httpStatusText.FAIL, "Chat users must be at most 2", null);
      }
    }

    // If chat is groupChat it should have name
    if (isGroupChat && !groupName) {
      return sendResponse(res, 400, httpStatusText.FAIL, "Group name is required", null);
    }

    // Find the chat
    const chat = await ChatModel.findById(req.params.chatId);

    if (!chat) {
      return sendResponse(res, 404, httpStatusText.FAIL, "Chat is not found", null);
    }

    // For non-group chat
    if (!chat.users.includes(userId)) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    // For group chat
    if (chat?.isGroupChat && chat.groupAdmin != userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    // Check is chat creator userId exists in users
    if (!users.includes(userId)) {
      return sendResponse(res, 403, httpStatusText.FAIL, "userId is required in users", null);
    }

    // Update the chat
    chat.users = users;

    if (isGroupChat) {
      chat.isGroupChat = isGroupChat;
      chat.groupName = groupName;
      chat.groupAdmin = userId;
    } else {
      chat.isGroupChat = false;
      chat.groupName = "";
      chat.groupAdmin = null;
    }

    await chat.save();

    await chat.populate({
      path: "users",
      select: "_id name email avatar roles"
    });

    await chat.populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "_id name email avatar roles"
      }
    });

    await chat.populate({
      path: "groupAdmin",
      select: "_id name email avatar roles"
    });

    // Handle images url
    chat.users.map((user) => {
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    if (chat?.latestMessage) {
      chat.latestMessage.sender.avatar = createImagesUrl([chat.latestMessage.sender.avatar])[0];
    }

    if (chat?.groupAdmin) {
      chat.groupAdmin.avatar = createImagesUrl([chat.groupAdmin.avatar])[0];
    }

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "chat is updated",
      chat
    );
  }
);

const deleteChat = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const chatId = req.params.chatId;

    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return sendResponse(res, 404, httpStatusText.FAIL, "chat is not found", null);
    }

    if (
      !chat.users.includes(userId)
      || (chat.isGroupChat && chat.groupAdmin != userId)
    ) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    await MessageModel.deleteMany({ chat: chatId });

    await chat.deleteOne();

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "chat is deleted",
      null
    );
  }
);

const leaveGroupChat = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const chatId = req.params.chatId;

    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return sendResponse(res, 404, httpStatusText.FAIL, "chat is not found", null);
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, "user is not found", null);
    }

    if (!chat.isGroupChat) {
      return sendResponse(res, 400, httpStatusText.FAIL, "this is not group chat", null);
    }

    if (!chat.users.includes(userId)) {
      return sendResponse(res, 403, httpStatusText.FAIL, "you are not a group member", null);
    }

    if (chat.users.length === 2 || chat.groupAdmin == userId) {
      await MessageModel.deleteMany({ chat: chatId });
      await chat.deleteOne();
    } else {
      await MessageModel.deleteMany({ sender: userId });
      chat.users = chat.users.filter(id => id != userId);
      await chat.save();
    }

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "you left the group",
      null
    );
  }
);

const getChatMessages = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const chatId = req.params.chatId;

    const chat = await ChatModel.findById(chatId);

    if (!chat.users.includes(userId)) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    const messages = await MessageModel.find({ chat: chatId })
      .populate({
        path: "sender",
        select: "_id name email avatar roles"
      });

    // Handle avatar url
    messages.map((message) => {
      message.sender.avatar = createImagesUrl([message.sender.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching messages",
      messages
    );
  }
);

const createMessage = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const chatId = req.params.chatId;
    const content = req.body.content;

    // Check if user exists in db
    const IsUserExist = await UserModel.exists({ _id: userId });
    if (!IsUserExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, "User does not exist", null);
    }

    // Check if chat exists in db
    const IsChatExist = await ChatModel.exists({ _id: chatId });
    if (!IsChatExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, "Chat does not exist", null);
    }

    const newMessage = await MessageModel.create({
      sender: userId,
      chat: chatId,
      content: content,
    });

    await ChatModel.updateOne({ _id: chatId }, { latestMessage: newMessage });

    await newMessage.populate({
      path: "sender",
      select: "_id name email avatar roles"
    });

    newMessage.sender.avatar = createImagesUrl([newMessage.sender.avatar])[0];

    sendResponse(
      res,
      201,
      httpStatusText.SUCCESS,
      "message is sent",
      newMessage
    );
  }
);

const getMessage = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const chatId = req.params.chatId;
    const messageId = req.params.messageId;

    const chat = await ChatModel.findById(chatId);

    if (!chat.users.includes(userId)) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    const message = await MessageModel.findById(messageId)
      .populate({
        path: "sender",
        select: "_id name email avatar roles"
      });

    if (!message) {
      return sendResponse(res, 404, httpStatusText.FAIL, "message is not found", null);
    }

    message.sender.avatar = createImagesUrl([message.sender.avatar])[0];

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching message",
      message
    );
  }
);

const updateMessage = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const messageId = req.params.messageId;
    const content = req.body.content;

    const message = await MessageModel.findById(messageId)
      .populate({
        path: "sender",
        select: "_id name email avatar roles"
      });

    if (!message) {
      return sendResponse(res, 404, httpStatusText.FAIL, "message is not found", null);
    }

    if (message.sender._id != userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    message.sender.avatar = createImagesUrl([message.sender.avatar])[0];

    message.content = content;
    await message.save();

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "message is updated",
      message
    );
  }
);

const deleteMessage = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const chatId = req.params.chatId;
    const messageId = req.params.messageId;

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return sendResponse(res, 404, httpStatusText.FAIL, "message is not found", null);
    }

    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return sendResponse(res, 404, httpStatusText.FAIL, "chat is not found", null);
    }

    if (message.sender != userId && chat.groupAdmin != userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
    }

    await message.deleteOne();

    const latestMessage = await MessageModel.findOne({ chat: chatId })
      .sort({ createdAt: -1 });

    await chat.updateOne({ latestMessage: latestMessage });

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "message is deleted",
      null
    );
  }
);

module.exports = {
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
}