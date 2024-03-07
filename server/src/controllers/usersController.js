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
const ChatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");
const httpStatusText = require("../utils/httpStatusText");
const ROLES_LIST = require("../utils/roles_list");
const sendResponse = require("../utils/sendResponse");
const createImagesUrl = require("../utils/createImagesUrl");
const handleImageQuality = require("../utils/handleImageQuality");
const uploadToFirebase = require("../utils/uploadToFirebase");
const removeFromFirebase = require("../utils/removeFromFirebase");

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
      searchQuery = { ...searchQuery, roles: { $in: [ROLES_LIST.Editor] } };
    }
    if (query?.onlyAdmins) {
      searchQuery = { ...searchQuery, roles: { $in: [ROLES_LIST.Admin] } };
    }

    const users = await UserModel.find(
      searchQuery,
      "_id name email avatar roles createdAt"
    )
      .skip(skip)
      .limit(limit);

    users.forEach((user) => {
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "Successful fetching users",
      users
    );
  }
);

const searchUsers = asyncHandler(
  async (req, res) => {
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    let searchQuery = {
      roles: { $in: [ROLES_LIST.User] },
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
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching users",
      users
    );
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
        status: httpStatusText.FAIL,
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
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching users",
      suggestedUsers
    );
  }
);

const getUser = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;

    let user = await UserModel.findById(
      userId,
      "_id name email avatar roles bio links"
    );

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with id ${userId} not found`, null);
    }

    user.avatar = createImagesUrl([user.avatar])[0];

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching user",
      user
    );
  }
);

const multerOptions = () => {
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads');
    },
    filename: function (req, file, cb) {
      const fileName = `user-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
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
    const userId = req.params.userId;
    const { name, oldPassword, newPassword, bio, links } = req.body;
    const avatar = req?.file?.filename;

    // Function to remove avatar
    const removeAvatar = () => {
      if (avatar) {
        fs.unlink(
          path.join(__dirname, "..", "uploads", avatar),
          () => { }
        );
      }
    };

    if (userInfo.userId != userId) {
      removeAvatar();
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const user = await UserModel.findById(userId)
      .select("_id name email password avatar links bio");

    if (!user) {
      removeAvatar();
      return sendResponse(res, 404, httpStatusText.FAIL, `user with id ${userId} is not found`, null);
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
        // Remove old avatar if it is not default avatar
        fs.unlink(
          path.join(__dirname, "..", "uploads", user.avatar),
          () => { }
        );

        // Remove old avatar from firebase
        await removeFromFirebase(user.avatar);
      }

      // Process new uploaded avatar quality
      await handleImageQuality(avatar, avatar, 225, 225, 80);

      // Upload new avatar to firebase
      fs.readFile(
        path.join(__dirname, '..', 'uploads', req.file.filename),
        async (err, data) => {
          if (err) return console.error('Error reading file:', err);
          req.file.buffer = data;
          await uploadToFirebase(req.file);
        }
      );

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
    updatedUser.avatar = createImagesUrl([updatedUser.avatar])[0];

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      message,
      updatedUser
    );
  }
);

const deleteUser = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const userInfo = req.userInfo;
    const { password } = req.body;

    if (
      userId != userInfo.userId
      && !userInfo.roles.includes(ROLES_LIST.Admin)
    ) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with id ${userId} not found`, null);
    }

    if (!userInfo.roles.includes(ROLES_LIST.Admin)) {
      if (!password) {
        return sendResponse(res, 400, httpStatusText.FAIL, `password required`, null);
      }

      const IsPasswordMatch = await bcrypt.compare(password, user.password);

      if (!IsPasswordMatch) {
        return sendResponse(res, 401, httpStatusText.FAIL, `wrong password`, null);
      }
    }

    // Delete user avatar
    if (user.avatar !== "defaultAvatar.png") {
      fs.unlink(
        path.join(__dirname, "..", "uploads", user.avatar),
        () => { }
      );

      // Remove avatar from firebase
      await removeFromFirebase(user.avatar);
    }

    // delete user posts images and posts comments
    const posts = await PostModel.find({ creator: user._id }, "images");

    posts.map(async (post) => {
      if (post?.images && post.images.length > 0) {
        post.images.map(async (image) => {
          fs.unlink(
            path.join(__dirname, "..", "uploads", image),
            () => { }
          );

          // Remove images from firebase
          await removeFromFirebase(image);
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

    // Delete user chats
    const chats = await ChatModel.find({
      users: { $elemMatch: { $eq: req.userInfo.userId } }
    });

    for (const chat of chats) {
      if (!chat.isGroupChat) {
        await MessageModel.deleteMany({ chat: chat._id });
        await ChatModel.deleteOne({ _id: chat._id });
      } else {
        if (
          chat.groupAdmin == user._id
          || chat.users.length === 2
        ) {
          await MessageModel.deleteMany({ chat: chat._id });
          await ChatModel.deleteOne({ _id: chat._id });
        } else {
          await MessageModel.deleteMany({ chat: chat._id, sender: user._id });
        }
      }
    }

    // Delete user
    await UserModel.deleteOne({ _id: userId });

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "account is deleted",
      null
    );
  }
);

const getFollowers = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
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
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching followers",
      followers
    );
  }
);

const IsUserFollower = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const targetUserId = req.params.targetUserId;

    // Check if the user with userId followed by user with targetUserId
    const isFollower = await UserModel.exists({
      _id: userId,
      followers: targetUserId
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "",
      Boolean(isFollower)
    );
  }
);

const removeFollower = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const userId = req.params.userId;
    const removedFollowerId = req.params.targetUserId;

    if (!removedFollowerId) {
      return sendResponse(res, 400, httpStatusText.FAIL, `follower id is required`, null);
    }

    if (userId !== userInfo.userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { followers: removedFollowerId } }
    );

    await UserModel.updateOne(
      { _id: removedFollowerId },
      { $pull: { followings: userId } }
    );

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "user is removed from your followers",
      null
    );
  }
);

const getFollowings = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
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
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching followings",
      followings
    );
  }
);

const FollowUser = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const userId = req.params.userId;
    const newFollowedId = req.params.targetUserId;

    if (!newFollowedId) {
      return sendResponse(res, 400, httpStatusText.FAIL, `user id required`, null);
    }

    if (userId !== userInfo.userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
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

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "user is followed",
      null
    );
  }
);

const removeFollowing = asyncHandler(
  // unfollow
  async (req, res) => {
    const userInfo = req.userInfo;
    const userId = req.params.userId;
    const removedFollowingId = req.params.targetUserId;

    if (!removedFollowingId) {
      return sendResponse(res, 400, httpStatusText.FAIL, `user id required`, null);
    }

    if (userId !== userInfo.userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { followings: removedFollowingId } }
    );

    await UserModel.updateOne(
      { _id: removedFollowingId },
      { $pull: { followers: userId } }
    );

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "user is unFollowed",
      null
    );
  }
);

const IsUserFollowed = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const targetUserId = req.params.targetUserId;

    // Check if the user with userId follows the user with targetUserId
    const isFollowed = await UserModel.exists({
      _id: userId,
      followings: targetUserId
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "",
      Boolean(isFollowed)
    );
  }
);

const getCreatedPosts = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find(
      { creator: userId },
      "_id creator title content images createdAt updatedAt",
    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    posts.map((post) => {
      post.images = createImagesUrl(post.images);
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching created posts",
      posts
    );
  }
);

const getLikedPosts = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (userId != userInfo.userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const user = await UserModel.findById(userId)
      .select("likedPosts")
      .populate({
        path: "likedPosts",
        select: "_id creator title content images createdAt updatedAt",
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with id ${userId} not found`, null);
    }

    const likedPosts = user?.likedPosts || [];

    likedPosts.map((post) => {
      post.images = createImagesUrl(post.images);
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching liked posts",
      likedPosts
    );
  }
);

const getSavedPosts = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (userId != userInfo.userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const user = await UserModel.findById(userId)
      .select("savedPosts")
      .populate({
        path: "savedPosts",
        select: "_id creator title content images createdAt updatedAt",
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with id ${userId} not found`, null);
    }

    const savedPosts = user?.savedPosts || [];

    savedPosts.map((post) => {
      post.images = createImagesUrl(post.images);
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching saved posts",
      savedPosts
    );
  }
);

const getCreatedComments = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (userId != userInfo.userId) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const createdComments = await CommentModel.find({ creator: userId })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "creator",
        select: "_id name avatar"
      })
      .populate({
        path: "post",
        select: "_id creator"
      })
      .sort({ updatedAt: -1 });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching created comments",
      createdComments
    );
  }
);

const getCreatedReports = asyncHandler(
  async (req, res) => {
    const userId = req.params.userId;
    const userInfo = req.userInfo;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    if (
      userId != userInfo.userId
      && !userInfo.roles.includes(ROLES_LIST.Admin)
    ) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const createdReports = await ReportModel.find({ sender: userId })
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching created reports",
      createdReports
    );
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
  IsUserFollower,
  getFollowings,
  FollowUser,
  removeFollowing,
  IsUserFollowed,
  getCreatedPosts,
  getLikedPosts,
  getSavedPosts,
  getCreatedComments,
  getCreatedReports,
}