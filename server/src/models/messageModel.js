const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
      required: true
    },
    content: {
      type: String,
      trim: true,
      required: true
    },
  },
  {
    timestamps: true
  }
);

const MessageModel = mongoose.model("messages", messageSchema);
module.exports = MessageModel