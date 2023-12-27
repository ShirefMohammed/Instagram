const express = require('express');
const multer = require('multer');
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require('../middleware/verifyRoles');
const ROLES_LIST = require('../utils/roles_list');
const {
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
} = require("../controllers/usersController");

// getUsers, Admins or Editors is Only Available for Admin
// searchUsers Users is Available for All
// getSuggestedUsers Users is Available for All verified

// getUser is Available for All
// updateUser is Only Available for Owner
// deleteUser is Available for Both Owner and Admin

// getFollowers is Available for All
// removeFollower is Only Available for Owner

// getFollowings is Available for All
// FollowUser is Available for verified Users
// removeFollowing is Only Available for Owner

// getCreatedPosts is Available for All
// getLikedPosts is Available for Owner
// getSavedPosts is Available for Owner
// getCreatedComments is Available for Owner
// getCreatedReports is Available for Both Owner and Admin

router.route('/')
  .get(
    verifyJWT,
    verifyRoles([ROLES_LIST.Admin]),
    getUsers
  );

router.route('/search')
  .get(
    searchUsers
  );

router.route('/suggest')
  .get(
    verifyJWT,
    getSuggestedUsers
  );

const { storage, fileFilter } = multerOptions();
const upload = multer({ storage, fileFilter });
router.route('/:id')
  .get(
    getUser
  )
  .patch(
    verifyJWT,
    upload.single('avatar'),
    updateUser
  )
  .delete(
    verifyJWT,
    deleteUser
  );

router.route('/:id/followers')
  .get(
    getFollowers
  )
  .delete(
    verifyJWT,
    removeFollower
  );

router.route('/:id/followings')
  .get(
    getFollowings
  )
  .post(
    verifyJWT,
    FollowUser
  )
  .delete(
    verifyJWT,
    removeFollowing
  );

router.route('/:id/createdPosts')
  .get(
    getCreatedPosts
  );

router.route('/:id/likedPosts')
  .get(
    verifyJWT,
    getLikedPosts
  );

router.route('/:id/savedPosts')
  .get(
    verifyJWT,
    getSavedPosts
  );

router.route('/:id/createdComments')
  .get(
    verifyJWT,
    getCreatedComments
  );

router.route('/:id/createdReports')
  .get(
    verifyJWT,
    getCreatedReports
  );

module.exports = router;
