const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true
  }
);

const CommentModel = mongoose.model("comments", commentSchema);
module.exports = CommentModel;
