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

// getUsers, users, admins or editors is only available for admin
// searchUsers users is available for all
// getSuggestedUsers users is available for verified users

// getUser is available for all
// updateUser is only available for account owner
// deleteUser is available for both account owner and admin

// getFollowers is available for all
// removeFollower is only available for account owner

// getFollowings is available for all
// followUser is available for verified users
// removeFollowing is only available for account owner

// getCreatedPosts is available for all
// getLikedPosts is available for account owner
// getSavedPosts is available for account owner
// getCreatedComments is available for account owner
// getCreatedReports is available for both account owner and admin

router.route('/')
  .get(
    verifyJWT,
    verifyRoles([ROLES_LIST.Admin]),
    getUsers
  );

router.route('/search').get(searchUsers);

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
