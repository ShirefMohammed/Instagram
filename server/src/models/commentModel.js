const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users"
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "posts"
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
