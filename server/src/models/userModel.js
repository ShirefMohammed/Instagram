const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
      default: "defaultAvatar.png"
    },
    roles: {
      User: {
        type: Number,
        default: 2001
      },
      Editor: {
        type: Number,
      },
      Admin: {
        type: Number,
      },
    },
    refreshToken: [String],
    bio: { type: String },
    links: [String],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;

/**
  {
    notifications,
    sharedPosts(optional...),
    verified(optional...)
  }
 */