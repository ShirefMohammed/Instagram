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

// getPosts is only available for admin
// getExploredPosts is available for all
// getSuggestedPosts is available for all

// createPost is only available for verified user
// getPost is available for all
// updatePost is only available for creator
// deletePost is available for creator and admin

// getPostLikes is available for all
// addPostLike is only available for verified user
// removePostLike is only available for verified user

// savePost is only available for verified user
// unsavePost is only available for verified user

// getPostComments is available for all
// addPostComment is only available for verified user
// updatePostComment is only available for comment creator
// removePostComment is available for comment creator, post creator and admin

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
    upload.array('images', 12),
    createPost
  );

router.route('/explore').get(getExploredPosts);

router.route('/suggest').get(getSuggestedPosts);

router.route('/:postId')
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

router.route('/:postId/likes')
  .get(
    getPostLikes
  )
  .post(
    verifyJWT,
    addPostLike
  )
  .delete(
    verifyJWT,
    removePostLike
  );

router.route('/:postId/save')
  .post(
    verifyJWT,
    savePost
  )
  .delete(
    verifyJWT,
    unsavePost
  );

router.route('/:postId/comments')
  .get(
    getPostComments
  )
  .post(
    verifyJWT,
    addPostComment
  );

router.route('/:postId/comments/:commentId')
  .patch(
    verifyJWT,
    updatePostComment
  )
  .delete(
    verifyJWT,
    removePostComment
  );

module.exports = router;