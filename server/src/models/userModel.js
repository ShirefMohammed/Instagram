const mongoose = require("mongoose");
const ROLES_LIST = require("../utils/roles_list");

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
      type: [Number],
      enum: [
        ROLES_LIST.User,
        ROLES_LIST.Editor,
        ROLES_LIST.Admin
      ],
      default: ROLES_LIST.User
    },
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