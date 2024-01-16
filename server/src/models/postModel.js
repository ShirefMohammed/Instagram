const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users"
    },
    content: {
      type: String,
    },
    images: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true
  }
);

const PostModel = mongoose.model("posts", postSchema);
module.exports = PostModel;
