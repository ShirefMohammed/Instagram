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

// getPosts is Only Available For Admin
// getExploredPosts is Available For All
// getSuggestedPosts is Available For All

// createPost is Only Available For User
// getPost is Available For All
// updatePost is Only Available For Creator
// deletePost is Available For Creator and Admin

// getPostLikes is Available For All
// addPostLike is Only Available For User
// removePostLike is Only Available For User

// savePost is Only Available For User
// unsavePost is Only Available For User

// getPostComments is Available For All
// addPostComment is Only Available For User
// updatePostComment is Only Available For Creator
// removePostComment is Available For Both Creator and Admin

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