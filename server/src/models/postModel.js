const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    content: {
      type: String
    },
    images: {
      type: [String],
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true
  }
);

const PostModel = mongoose.model("posts", postSchema);
module.exports = PostModel;
