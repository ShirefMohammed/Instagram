const path = require("node:path");
const fs = require("node:fs");
const multer = require('multer');
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const PostModel = require("../models/postModel");
const CommentModel = require('../models/commentModel');
const UserModel = require('../models/userModel');
const ROLES_LIST = require("../utils/roles_list");
const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");
const createImagesUrl = require("../utils/createImagesUrl");
const handleImageQuality = require("../utils/handleImageQuality");
const uploadToFirebase = require("../utils/uploadToFirebase");
const removeFromFirebase = require("../utils/removeFromFirebase");

const getPosts = asyncHandler(
  async (req, res) => {
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const sort = query?.sort || -1;

    const posts = await PostModel.find()
      .skip(skip)
      .limit(limit)
      .select("-likes")
      .populate({
        path: "creator",
        select: "_id name email avatar roles"
      })
      .sort({ createdAt: sort });

    posts.map((post) => {
      post.images = createImagesUrl(post.images);
      post.creator.avatar = createImagesUrl([post.creator.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching posts",
      posts
    );
  }
);

const getExploredPosts = asyncHandler(
  async (req, res) => {
    const exceptedPosts = req.query?.exceptedPosts ?
      req.query.exceptedPosts.split(",") : [];

    const limit = +req.query?.limit || 10;

    const posts = await PostModel.aggregate([
      {
        $match: {
          _id: {
            $nin: exceptedPosts.map(id => new mongoose.Types.ObjectId(id))
          }
        }
      },
      { $sample: { size: limit } },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          images: 1,
          createdAt: 1,
          updatedAt: 1,
          'creator._id': 1,
          'creator.name': 1,
          'creator.email': 1,
          'creator.avatar': 1,
          'creator.roles': 1,
        },
      },
    ]);

    posts.map((post) => {
      post.images = createImagesUrl(post.images);
      post.creator.avatar = createImagesUrl([post.creator.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching posts",
      posts
    );
  }
);

const getSuggestedPosts = asyncHandler(
  async (req, res) => {
    const query = req.query;

    const limit = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find()
      .skip(skip)
      .limit(limit)
      .select("-likes")
      .populate({
        path: "creator",
        select: "_id name email avatar roles"
      })
      .sort({ createdAt: -1 });

    posts.map((post) => {
      post.images = createImagesUrl(post.images);
      post.creator.avatar = createImagesUrl([post.creator.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching posts",
      posts
    );
  }
);

const multerOptions = () => {
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads');
    },
    filename: function (req, file, cb) {
      const fileName = `post-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`;
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

const createPost = asyncHandler(
  async (req, res) => {
    const creatorId = req.userInfo.userId;
    const content = req.body?.content;

    const IsCreatorExist = await UserModel.exists({ _id: creatorId });

    if (!IsCreatorExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, "Creator does not exist", null);
    }

    let images = [];

    if (!req?.files || req?.files?.length < 1) {
      return sendResponse(res, 400, httpStatusText.FAIL, "You should upload one image at least", null);
    } else {
      images = req.files.map(image => image.filename);
    }

    const newPost = await PostModel.create({
      creator: creatorId,
      content: content,
      images: images,
    });

    await Promise.all(newPost.images.map(async (image) => {
      await handleImageQuality(image, image, 500, null, 80);
    }));

    if (req?.files) {
      req.files.map(async (file) => {
        fs.readFile(
          path.join(__dirname, '..', 'uploads', file.filename),
          async (err, data) => {
            if (err) return console.error('Error reading file:', err);
            file.buffer = data;
            await uploadToFirebase(file);
          }
        );
      });
    }

    newPost.images = createImagesUrl(newPost.images);

    sendResponse(
      res,
      201,
      httpStatusText.SUCCESS,
      "Post is created",
      newPost
    );
  }
);

const getPost = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;

    const post = await PostModel.findById(postId)
      .populate({ path: "creator", select: "_id name avatar" })
      .select("_id creator content images createdAt updatedAt");
    // you can handle fetching likes and comments length *optional

    if (!post) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    post.creator.avatar = createImagesUrl([post.creator.avatar])[0];
    post.images = createImagesUrl(post.images);

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching post",
      post
    );
  }
);

const updatePost = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const postId = req?.params?.postId;
    const content = req.body?.content;

    const post = await PostModel.findById(postId);

    if (!post) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    if (userInfo.userId != post.creator) {
      return sendResponse(res, 403, httpStatusText.FAIL, `You don't have access`, null);
    }

    await PostModel.findByIdAndUpdate(
      postId,
      { content: content },
    );

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "Post is updated",
      { content: content }
    );
  }
);

const deletePost = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const postId = req?.params?.postId;

    const post = await PostModel.findById(postId);

    if (!post) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    if (
      !userInfo.roles.includes(ROLES_LIST.Admin)
      && userInfo.userId != post.creator
    ) {
      return sendResponse(res, 403, httpStatusText.FAIL, `You don't have access to delete`, null);
    }

    // Delete all post comments
    await CommentModel.deleteMany({ post: postId });

    // Delete post images from server
    if (post?.images && post.images.length > 0) {
      post.images.map(async (image) => {
        // Remove images from local uploads folder
        fs.unlink(
          path.join(__dirname, "..", "uploads", image),
          () => { }
        );

        // Remove images from firebase
        await removeFromFirebase(image);
      });
    }

    // Delete the post
    await post.deleteOne();

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "Post is deleted",
      null
    );
  }
);

const getPostLikes = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const post = await PostModel.findById(postId)
      .select("likes")
      .populate({
        path: "likes",
        select: "_id name email avatar",
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!post) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    const usersLikedPost = post.likes;

    usersLikedPost.map((user) => {
      user.avatar = createImagesUrl([user.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching people who liked this post",
      usersLikedPost
    );
  }
);

const addPostLike = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;
    const userId = req.userInfo.userId;

    const post = await PostModel.findById(postId, "likes");

    if (!post) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    const user = await UserModel.findById(userId, "likedPosts");

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with Id ${userId} Not Found`, null);
    }

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    if (!user.likedPosts.includes(postId)) {
      user.likedPosts.push(postId);
      await user.save();
    }

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "like is added",
      null
    );
  }
);

const removePostLike = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;
    const userId = req.userInfo.userId;

    const post = await PostModel.findById(postId, "likes");

    if (!post) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    const user = await UserModel.findById(userId, "likedPosts");

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with Id ${userId} Not Found`, null);
    }

    post.likes = post.likes.filter(id => id != userId);
    await post.save();

    user.likedPosts = user.likedPosts.filter(id => id != postId);
    await user.save();

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "like is removed",
      null
    );
  }
);

const savePost = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;
    const userId = req.userInfo.userId;

    const IsPostExist = await PostModel.exists({ _id: postId });

    if (!IsPostExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);
    }

    const user = await UserModel.findById(userId, "savedPosts");

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with Id ${userId} Not Found`, null);
    }

    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "Post is saved",
      null
    );
  }
);

const unsavePost = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;
    const userId = req.userInfo.userId;

    const IsPostExist = await PostModel.exists({ _id: postId });

    if (!IsPostExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id {${postId}} not found`, null);

    }

    const user = await UserModel.findById(userId, "savedPosts");

    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with Id ${userId} Not Found`, null);

    }

    user.savedPosts = user.savedPosts.filter(id => id != postId);
    await user.save();

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "post is unsaved",
      null
    );
  }
);

const getPostComments = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.postId;
    const query = req.query;

    const limit = query?.limit || 5;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const sort = query?.sort || 1;

    const comments = await CommentModel.find({ post: postId })
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
      .sort({ createdAt: sort });

    comments.map((comment) => {
      comment.creator.avatar = createImagesUrl([comment.creator.avatar])[0];
    });

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching comments",
      comments
    );
  }
);

const addPostComment = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const postId = req?.params?.postId;
    const content = req?.body?.content;

    if (!content) {
      return sendResponse(res, 400, httpStatusText.FAIL, `Comment content required`, null);
    }

    const IsPostExist = await PostModel.exists({ _id: postId });

    if (!IsPostExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Post with Id ${postId} Not Found`, null);
    }

    const IsUserExist = await UserModel.exists({ _id: userId });

    if (!IsUserExist) {
      return sendResponse(res, 404, httpStatusText.FAIL, `user with Id ${userId} Not Found`, null);
    }

    const newComment = await CommentModel.create({
      creator: userId,
      post: postId,
      content: content
    });

    // Populate the 'creator' field
    await newComment.populate({
      path: 'creator',
      select: "_id name avatar"
    });

    newComment.creator.avatar = createImagesUrl([newComment.creator.avatar])[0];

    // Populate the 'post' field
    await newComment.populate({
      path: 'post',
      select: "_id creator"
    });

    sendResponse(
      res,
      201,
      httpStatusText.SUCCESS,
      "Comment is added",
      newComment
    );
  }
);

const updatePostComment = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const postId = req?.params?.postId;
    const commentId = req?.params?.commentId;
    const content = req?.body?.content;

    if (!commentId) {
      return sendResponse(res, 400, httpStatusText.FAIL, `Comment id required`, null);
    }

    if (!content) {
      return sendResponse(res, 400, httpStatusText.FAIL, `Comment content required`, null);
    }

    const comment = await CommentModel.findById(commentId)
      .populate({
        path: 'creator',
        select: "_id name avatar"
      })
      .populate({
        path: 'post',
        select: "_id creator"
      })

    if (!comment) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Comment not found`, null);
    }

    if (userId != comment.creator._id || postId != comment.post._id) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    comment.content = content;
    await comment.save();

    comment.creator.avatar = createImagesUrl([comment.creator.avatar])[0];

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "Comment is updated",
      comment
    );
  }
);

const removePostComment = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const roles = req.userInfo.roles;
    const commentId = req?.params?.commentId;

    if (!commentId) {
      return sendResponse(res, 400, httpStatusText.FAIL, `Comment id is required`, null);
    }

    const comment = await CommentModel.findById(commentId)
      .populate({ path: "post", select: "creator" });

    if (!comment) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Comment not found`, null);
    }

    if (
      userId != comment.creator
      && userId != comment.post.creator
      && !roles.includes(ROLES_LIST.Admin)
    ) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    await comment.deleteOne();

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "Comment is deleted",
      null
    );
  }
);

module.exports = {
  getPosts,
  getExploredPosts,
  getSuggestedPosts,
  multerOptions,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getPostLikes,
  addPostLike,
  removePostLike,
  savePost,
  unsavePost,
  getPostComments,
  addPostComment,
  updatePostComment,
  removePostComment,
}