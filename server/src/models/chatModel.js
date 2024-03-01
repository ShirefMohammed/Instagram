const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      }
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      default: null
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      trim: true,
      default: ""
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null
    },
  },
  {
    timestamps: true
  }
);

const ChatModel = mongoose.model("chats", chatSchema);
module.exports = ChatModel;