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
      .sort({ updatedAt: sort });

    if (posts.length > 0) {
      posts.map((post) => {
        if (post?.images && post.images.length > 0) {
          const imagesUrl = post.images.map((image) => {
            return `${process.env.SERVER_URL}/api/uploads/${image}`;
          });
          post.images = imagesUrl;
          post.creator.avatar = `${process.env.SERVER_URL}/api/uploads/${post.creator.avatar}`;
        }
      });
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching posts",
      data: posts
    });
  }
);

const getExploredPosts = asyncHandler(
  async (req, res) => {
    const exceptedPosts = req.query?.exceptedPosts ?
      req.query.exceptedPosts?.split(",")
      : [];
    const limit = +req.query?.limit || 10;

    console.log(exceptedPosts)
    console.log(exceptedPosts.map(id => new mongoose.Types.ObjectId(id)));

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

    if (posts.length > 0) {
      posts.map((post) => {
        if (post?.images && post.images.length > 0) {
          const imagesUrl = post.images.map((image) => {
            return `${process.env.SERVER_URL}/api/uploads/${image}`;
          });
          post.images = imagesUrl;
          post.creator.avatar = `${process.env.SERVER_URL}/api/uploads/${post.creator.avatar}`;
        }
      });
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching posts",
      data: posts
    });
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
      .sort({ updatedAt: -1 });

    posts.map((post) => {
      if (post?.images && post.images.length > 0) {
        const imagesUrl = post.images.map((image) => {
          return `${process.env.SERVER_URL}/api/uploads/${image}`;
        });
        post.images = imagesUrl;
      }
      post.creator.avatar = new URL(
        `${post.creator.avatar}`,
        `${process.env.SERVER_URL}/api/uploads/`
      )
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching posts",
      data: posts
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
      const fileName = `post-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
      cb(null, fileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    const imageType = file.mimetype.split('/')[0];
    if (imageType === 'image') {
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
    let images = req?.files;

    console.log(images)

    const IsCreatorExist = await UserModel.exists({ _id: creatorId });
    if (!IsCreatorExist) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Creator does not exist",
        data: null
      });
    }

    if (images.length === 0) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "You should upload one image at least",
        data: null
      });
    }

    if (images) {
      images = images.map(image => image.filename);
    }

    const newPost = await PostModel.create({
      creator: creatorId,
      content: content,
      images: images,
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "Post created successfully",
      data: newPost,
    });
  }
);

const getPost = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;

    const post = await PostModel.findById(postId)
      .populate({ path: "creator", select: "_id name avatar" })
      .select("_id creator content images createdAt updatedAt");
    // you can handle fetching likes and comments length optional

    if (!post) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id {${postId}} not found`,
        data: null
      });
    }

    post.creator.avatar = `${process.env.SERVER_URL}/api/uploads/${post.creator.avatar}`

    let postImages = post.images.map(image => {
      return `${process.env.SERVER_URL}/api/uploads/${image}`;
    });
    post.images = postImages;

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching post",
      data: post
    });
  }
);

const updatePost = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const postId = req?.params?.id;
    const content = req.body?.content;

    console.log(userInfo, postId, content)

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id {${postId}} not found`,
        data: null
      });
    }

    if (userInfo.userId != post.creator) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: `You don't have access to update this post`,
        data: null
      });
    }

    await PostModel.findByIdAndUpdate(
      postId,
      { content: content },
      { new: true }
    )

    res.json({
      status: httpStatusText.SUCCESS,
      message: "Post updated successfully",
      data: { content: content }
    });
  }
);

const deletePost = asyncHandler(
  async (req, res) => {
    const userInfo = req.userInfo;
    const postId = req?.params?.id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id {${postId}} not found`,
        data: null
      });
    }

    if (
      !userInfo.roles.includes(ROLES_LIST.Admin)
      || userInfo.userId != post.creator
    ) {
      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: `You don't have access to delete this post`,
        data: null
      });
    }

    if (post?.comments && post.comments.length > 0) {
      await CommentModel.deleteMany({ post: postId });
    }

    if (post?.images && post.images.length > 0) {
      post.images.map((image) => {
        fs.unlink(
          path.join(__dirname, "..", "uploads", image),
          () => { }
        );
      });
    }

    await post.deleteOne();

    res.json({
      status: httpStatusText.SUCCESS,
      message: "Post deleted successfully",
      data: null
    });
  }
);

const getPostLikes = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const sort = query?.sort || -1;

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
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id ${postId} Not Found`,
        data: null
      });
    }

    const usersLikedPost = post.likes;

    usersLikedPost.map((user) => {
      user.avatar = `${process.env.SERVER_URL}/api/uploads/${user.avatar}`;
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching people who liked this post",
      data: usersLikedPost
    });
  }
);

const addPostLike = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;
    const userId = req.userInfo.userId;

    const post = await PostModel.findById(postId, "likes");
    const user = await UserModel.findById(userId, "likedPosts");

    if (!post) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id ${postId} Not Found`,
        data: null
      });
    }

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with Id ${userId} Not Found`,
        data: null
      });
    }

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    if (!user.likedPosts.includes(postId)) {
      user.likedPosts.push(postId);
      await user.save();
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "like added successfully",
      data: null
    });
  }
);

const removePostLike = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;
    const userId = req.userInfo.userId;

    const post = await PostModel.findById(postId, "likes");
    const user = await UserModel.findById(userId, "likedPosts");

    if (!post) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id ${postId} Not Found`,
        data: null
      });
    }

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with Id ${userId} Not Found`,
        data: null
      });
    }

    post.likes = post.likes.filter(id => id != userId);
    await post.save();

    user.likedPosts = user.likedPosts.filter(id => id != postId);
    await user.save();

    res.json({
      status: httpStatusText.SUCCESS,
      message: "like removed successfully",
      data: null
    });
  }
);

const savePost = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;
    const userId = req.userInfo.userId;

    const IsPostExist = await PostModel.exists({ _id: postId });
    const user = await UserModel.findById(userId, "savedPosts");

    if (!IsPostExist) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id ${postId} Not Found`,
        data: null
      });
    }

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with Id ${userId} Not Found`,
        data: null
      });
    }

    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    res.json({
      status: httpStatusText.SUCCESS,
      message: "post saved successfully",
      data: null
    });
  }
);

const unsavePost = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;
    const userId = req.userInfo.userId;

    const IsPostExist = await PostModel.exists({ _id: postId });
    const user = await UserModel.findById(userId, "savedPosts");
    console.log(IsPostExist)

    if (!IsPostExist) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id ${postId} Not Found`,
        data: null
      });
    }

    if (!user) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with Id ${userId} Not Found`,
        data: null
      });
    }

    user.savedPosts = user.savedPosts.filter(id => id != postId);
    await user.save();

    res.json({
      status: httpStatusText.SUCCESS,
      message: "post unsaved successfully",
      data: null
    });
  }
);

const getPostComments = asyncHandler(
  async (req, res) => {
    const postId = req?.params?.id;
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const sort = query?.sort || 1;

    const comments = await CommentModel.find({ post: postId })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "creator",
        select: "_id name email avatar"
      })
      .sort({ createdAt: sort });

    comments.map((comment) => {
      comment.creator.avatar = new URL(
        comment.creator.avatar,
        `${process.env.SERVER_URL}/api/uploads/`
      );
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching post comments",
      data: comments
    });
  }
);

const addPostComment = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const postId = req?.params?.id;
    const content = req?.body?.content;

    if (!content) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "comment content required",
        data: null
      });
    }

    const IsPostExist = await PostModel.exists({ _id: postId });
    const ISUserExist = await UserModel.exists({ _id: userId });

    if (!IsPostExist) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Post with Id ${postId} Not Found`,
        data: null
      });
    }

    if (!ISUserExist) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `user with Id ${userId} Not Found`,
        data: null
      });
    }

    const newComment = await CommentModel.create({
      creator: userId,
      post: postId,
      content: content
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "comment added successfully",
      data: newComment
    });
  }
);

const updatePostComment = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const postId = req?.params?.id;
    const commentId = req?.body?.commentId;
    const content = req?.body?.content;

    if (!commentId) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "comment id required",
        data: null
      });
    }

    if (!content) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "comment content required",
        data: null
      });
    }

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: "comment not found",
        data: null
      });
    }

    if (userId != comment.creator || postId != comment.post) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    comment.content = content;
    await comment.save();

    res.json({
      status: httpStatusText.SUCCESS,
      message: "comment updated successfully",
      data: comment
    });
  }
);

const removePostComment = asyncHandler(
  async (req, res) => {
    const userId = req.userInfo.userId;
    const roles = req.userInfo.roles;
    const commentId = req?.body?.commentId;

    if (!commentId) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "comment id required",
        data: null
      });
    }

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: "comment not found",
        data: null
      });
    }

    if (userId != comment.creator || !roles.includes(ROLES_LIST.Admin)) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    await comment.deleteOne();

    res.json({
      status: httpStatusText.SUCCESS,
      message: "comment deleted successfully",
      data: null
    });
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