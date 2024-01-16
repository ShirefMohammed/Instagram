const express = require('express');
const multer = require('multer');
const router = express.Router();
const ROLES_LIST = require('../utils/roles_list');
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require('../middleware/verifyRoles');
const {
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
} = require("../controllers/postsController");

// getPosts is only available for Admin
// getExploredPosts is available for all
// getSuggestedPosts is available for all

// createPost is only available for User
// getPost is available for all
// updatePost is only available for creator
// deletePost is available for creator and Admin

// getPostLikes is available for all
// addPostLike is only available for User
// removePostLike is only available for User

// savePost is only available for User
// unsavePost is only available for User

// getPostComments is available for all
// addPostComment is only available for User
// updatePostComment is only available for comment creator
// removePostComment is available for comment creator, post creator and Admin

const { storage, fileFilter } = multerOptions();
const upload = multer({ storage, fileFilter });

router.route('/')
  .get(
    verifyJWT,
    verifyRoles([ROLES_LIST.Admin]),
    getPosts
  )
  .post(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    upload.array('images', 12),
    createPost
  );

router.route('/explore')
  .get(
    getExploredPosts
  );

router.route('/suggest')
  .get(
    getSuggestedPosts
  );

router.route('/:id')
  .get(
    getPost
  )
  .patch(
    verifyJWT,
    updatePost
  )
  .delete(
    verifyJWT,
    deletePost
  );

router.route('/:id/likes')
  .get(
    getPostLikes
  )
  .post(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    addPostLike
  )
  .delete(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    removePostLike
  );

router.route('/:id/save')
  .post(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    savePost
  )
  .delete(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    unsavePost
  );

router.route('/:id/comments')
  .get(
    getPostComments
  )
  .post(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    addPostComment
  )
  .patch(
    verifyJWT,
    updatePostComment
  )
  .delete(
    verifyJWT,
    removePostComment
  );

module.exports = router;