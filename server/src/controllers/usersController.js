const path = require("node:path");
const fs = require("node:fs");
const multer = require('multer');
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const PostModel = require("../models/postModel");
const CommentModel = require("../models/commentModel");
const ReportModel = require("../models/reportModel");
const UserModel = require("../models/userModel");
const httpStatusText = require("../utils/httpStatusText");
const ROLES_LIST = require("../utils/roles_list");

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const getUsers = asyncHandler(
  async (req, res) => {
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    let searchQuery = {};

    if (query?.onlyEditors) {
      searchQuery = { ...searchQuery, "roles.Editor": { $exists: true } }
    }
    if (query?.onlyAdmins) {
      searchQuery = { ...searchQuery, "roles.Admin": { $exists: true } }
    }

    const users = await UserModel.find(
      searchQuery,
      "_id name email avatar roles createdAt"
    )
      .skip(skip)
      .limit(limit);

    users.map((user) => {
      user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching users",
      data: users
    });
  }
);

const searchUsers = asyncHandler(
  async (req, res) => {
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    let searchQuery = {
      "roles.User": { $exists: true },
      $or: [
        { name: { $regex: query?.searchKey, $options: 'i' } },
        { email: { $regex: query?.searchKey, $options: 'i' } }
      ]
    };

    const users = await UserModel.find(
      searchQuery,
      "_id name email avatar roles createdAt"
    )
      .skip(skip)
      .limit(limit);

    users.map((user) => {
      user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching users",
      data: users
    });
  }
);

const getSuggestedUsers = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    let exceptedUsers = req.query?.exceptedUsers?.split(",") || [];
    const limit = +req.query?.limit || 5;

    const user = await UserModel.findById(userId, "followings");

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: "user not found",
        data: null
      });
    }

    exceptedUsers = [userId, ...user.followings, ...exceptedUsers];

    const suggestedUsers = await UserModel.aggregate([
      {
        $match: {
          _id: {
            $nin: exceptedUsers.map(id => new mongoose.Types.ObjectId(id))
          }
        }
      },
      { $sample: { size: limit } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
        },
      },
    ]);

    suggestedUsers.map((user) => {
      user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching users",
      data: suggestedUsers
    });
  }
);

const getUser = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;

    const user = await UserModel.findById(
      userId,
      "_id name email avatar bio links"
    );

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with id ${userId} not found`,
        data: null
      });
    }

    user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching user",
      data: user
    });
  }
);

const multerOptions = () => {
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads');
    },
    filename: function (req, file, cb) {
      const ext = file.mimetype.split('/')[1];
      const fileName = `user-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
      cb(null, fileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    const fileType = file.mimetype.split('/')[0];
    if (fileType === 'image') {
      return cb(null, true)
    } else {
      return cb(null, false)
    }
  }

  return {
    storage: diskStorage,
    fileFilter: fileFilter
  }
}

const updateUser = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const userId = req.params.id;
    const { name, oldPassword, newPassword, bio, links } = req.body;
    const avatar = req?.file?.filename;

    if (userInfo.userId != userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const user = await UserModel.findById(userId)
      .select("_id name email password avatar links bio");

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with id ${userId} not found`,
        data: null
      });
    }

    let message = "account updated successFully";
    let updatedFields = {};

    // Update name
    if (name) {
      // If name not valid
      if (!NAME_REGEX.test(name)) {
        message += ", and Name is not updated as Name must be 4 to 24 characters, Must begin with a letter, Letters, numbers, underscores, hyphens allowed, No spaces.";
      } else {
        updatedFields = { ...updatedFields, name: name };
      }
    }

    // Update password
    if (oldPassword && !newPassword) {
      message += ", and password is not updated as new password required";
    }

    if (!oldPassword && newPassword) {
      message += ", and password is not updated as old password required";
    }

    if (oldPassword && newPassword) {
      const IsPasswordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!IsPasswordMatch) {
        message += ", and password is not updated as old password is wrong";
      } else {
        // If password not valid
        if (!PASS_REGEX.test(newPassword)) {
          message += `, and Password is not updated as Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %`;
        } else {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          updatedFields = { ...updatedFields, password: hashedPassword };
        }
      }
    }

    // Update avatar
    if (avatar) {
      if (user.avatar !== "defaultAvatar.png") {
        fs.unlink(
          path.join(__dirname, "..", "uploads", user.avatar),
          () => { }
        );
      }
      updatedFields = { ...updatedFields, avatar: avatar };
    }

    // Update bio
    if (bio) {
      if (bio.length > 250) {
        message += `, and bio is not updated as Bio must be at most 250 characters`;
      } else {
        updatedFields = { ...updatedFields, bio: bio };
      }
    }

    // Update links
    if (links) {
      if (links.length > 3) {
        message += `, new link not added as you add all allowed number of links 3 links`;
      } else {
        updatedFields = { ...updatedFields, links: links };
      }
    }

    // Update user account
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    )
      .select("_id name email avatar bio links");

    // Set avatar url
    updatedUser.avatar = `${process.env.SERVER_URL}/api/uploads/${updatedUser.avatar}`;

    res.json({
      status: httpStatusText.SUCCESS,
      message: message,
      data: updatedUser
    });
  }
);

const deleteUser = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: `password required to delete user ${userId}`,
        data: null
      });
    }

    if (
      userId != userInfo.userId
      && !userInfo.roles.includes(ROLES_LIST.Admin)
    ) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with id ${userId} not found`,
        data: null
      });
    }

    const IsPasswordMatch = await bcrypt.compare(password, user.password);

    if (!IsPasswordMatch) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "wrong password",
        data: null
      });
    }

    // Delete user avatar
    if (user.avatar !== "defaultAvatar.png") {
      fs.unlink(
        path.join(__dirname, "..", "uploads", user.avatar),
        () => { }
      );
    }

    // delete user posts images and posts comments
    const posts = await PostModel.find({ creator: user._id }, "images");
    posts.map(async (post) => {
      if (post?.images && post.images.length > 0) {
        post.images.map((image) => {
          fs.unlink(
            path.join(__dirname, "..", "uploads", image),
            () => { }
          );
        });
      }
      await CommentModel.deleteMany({ post: post._id });
    });

    // Delete user posts
    await PostModel.deleteMany({ creator: user._id });

    // Delete user reports
    await ReportModel.deleteMany({ sender: user._id });

    // Delete user comments
    await CommentModel.deleteMany({ creator: user._id });

    // Delete user notification
    // soon

    // Delete user
    await UserModel.deleteOne({ _id: userId });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "account deleted successfully",
      data: null
    });
  }
);

const getFollowers = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const { followers } = await UserModel.findById(userId)
      .select("followers")
      .populate({
        path: "followers",
        select: "_id name email avatar",
        options: {
          skip: skip,
          limit: limit
        }
      });

    followers.map((user) => {
      user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching followers",
      data: followers
    });
  }
);

const removeFollower = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const { removedFollowerId } = req.body;

    if (!removedFollowerId) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "follower id required",
        data: null
      });
    }

    if (userId !== userInfo.userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { followers: removedFollowerId } }
    );

    await UserModel.updateOne(
      { _id: removedFollowerId },
      { $pull: { followings: userId } }
    );

    res.json({
      status: httpStatusText.SUCCESS,
      message: "user removed from your followers",
      data: null
    });
  }
);

const getFollowings = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const { followings } = await UserModel.findById(userId)
      .select("followings")
      .populate({
        path: "followings",
        select: "_id name email avatar",
        options: {
          skip: skip,
          limit: limit
        }
      });

    followings.map((user) => {
      user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching followings",
      data: followings
    });
  }
);

const FollowUser = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const { newFollowedId } = req.body;

    if (!newFollowedId) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "user id required",
        data: null
      });
    }

    if (userId !== userInfo.userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { followings: newFollowedId } }
    );

    await UserModel.updateOne(
      { _id: userId },
      { $push: { followings: newFollowedId } }
    );

    await UserModel.updateOne(
      { _id: newFollowedId },
      { $pull: { followers: userId } }
    );

    await UserModel.updateOne(
      { _id: newFollowedId },
      { $push: { followers: userId } }
    );

    res.json({
      status: httpStatusText.SUCCESS,
      message: "user followed successfully",
      data: null
    });
  }
);

const removeFollowing = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const { removedFollowingId } = req.body;

    if (!removedFollowingId) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "user id required",
        data: null
      });
    }

    if (userId !== userInfo.userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { followings: removedFollowingId } }
    );

    await UserModel.updateOne(
      { _id: removedFollowingId },
      { $pull: { followers: userId } }
    );

    res.json({
      status: httpStatusText.SUCCESS,
      message: "user unFollowed successfully",
      data: null
    });
  }
);

const getCreatedPosts = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find(
      { creator: userId },
      "_id creator title content images",
    )
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    if (posts.length > 0) {
      posts.map((post) => {
        if (post?.images && post.images.length > 0) {
          const imagesUrl = post.images.map((image) => {
            return `${process.env.SERVER_URL}/api/uploads/${image}`;
          });
          post.images = imagesUrl;
        }
      });
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching created posts",
      data: posts
    });
  }
);

const getLikedPosts = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (userId != userInfo.userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const user = await UserModel.findById(userId)
      .select("likedPosts")
      .populate({
        path: "likedPosts",
        select: "_id creator title content images",
        populate: {
          path: "creator",
          select: "_id name email avatar"
        },
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with id ${userId} not found`,
        data: null
      });
    }

    const likedPosts = user?.likedPosts || [];

    if (likedPosts.length > 0) {
      likedPosts.map((post) => {
        if (post?.images && post.images.length > 0) {
          post.images = post.images.map((image) => {
            return `${process.env.SERVER_URL}/api/uploads/${image}`;
          });
        }
        post.creator.avatar = new URL(
          post.creator.avatar,
          `${process.env.SERVER_URL}/api/uploads/`
        );
      });
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching liked posts",
      data: likedPosts
    });
  }
);

const getSavedPosts = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (userId != userInfo.userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const user = await UserModel.findById(userId)
      .select("savedPosts")
      .populate({
        path: "savedPosts",
        select: "_id creator title content images",
        populate: {
          path: "creator",
          select: "_id name email avatar"
        },
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with id ${userId} not found`,
        data: null
      });
    }

    const savedPosts = user?.savedPosts || [];

    if (savedPosts.length > 0) {
      savedPosts.map((post) => {
        if (post?.images && post.images.length > 0) {
          post.images = post.images.map((image) => {
            return `${process.env.SERVER_URL}/api/uploads/${image}`;
          });
        }
        post.creator.avatar = new URL(
          post.creator.avatar,
          `${process.env.SERVER_URL}/api/uploads/`
        );
      });
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching saved posts",
      data: savedPosts
    });
  }
);

const getCreatedComments = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (userId != userInfo.userId) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const createdComments = await CommentModel.find({ creator: userId })
      .limit(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching created comments",
      data: createdComments
    });
  }
);

const getCreatedReports = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (
      userId != userInfo.userId
      && !userInfo.roles.includes(ROLES_LIST.Admin)
    ) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const createdReports = await ReportModel.find({ sender: userId })
      .limit(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching created reports",
      data: createdReports
    });
  }
);

module.exports = {
  getUsers,
  searchUsers,
  getSuggestedUsers,
  getUser,
  multerOptions,
  updateUser,
  deleteUser,
  getFollowers,
  removeFollower,
  getFollowings,
  FollowUser,
  removeFollowing,
  getCreatedPosts,
  getLikedPosts,
  getSavedPosts,
  getCreatedComments,
  getCreatedReports,
}