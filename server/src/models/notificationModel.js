const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    type: {
      type: String,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "posts"
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "chats"
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "messages"
    },
    seen: {
      type: Boolean,
    },
  },
  {
    timestamps: true
  }
);

const NotificationModel = mongoose.model("notifications", notificationSchema);
module.exports = NotificationModel;
