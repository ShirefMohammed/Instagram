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
      required: true,
      default: null
    },
    isGroupChat: {
      type: Boolean,
      required: true,
      default: false
    },
    groupName: {
      type: String,
      trim: true,
      required: true,
      default: ""
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      default: null
    },
  },
  {
    timestamps: true
  }
);

const ChatModel = mongoose.model("chats", chatSchema);
module.exports = ChatModel;