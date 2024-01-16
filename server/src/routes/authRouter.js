const express = require("express");
const multer = require('multer');
const router = express.Router();
const {
  multerOptions,
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");

const { storage, fileFilter } = multerOptions();
const upload = multer({ storage, fileFilter });

router.route("/register").post(upload.single('avatar'), register);

router.route("/login").post(login);

router.route("/refresh").get(refresh);

router.route("/logout").get(logout);

module.exports = router;
