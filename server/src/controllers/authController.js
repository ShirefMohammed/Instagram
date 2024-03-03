const path = require("node:path");
const fs = require("node:fs");
const multer = require('multer');
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const UserModel = require("../models/userModel");
const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");
const createImagesUrl = require("../utils/createImagesUrl");
const handleImageQuality = require("../utils/handleImageQuality");

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

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

const register = asyncHandler(
  async (req, res) => {
    const { name, email, password } = req.body;

    // Function to remove avatar
    const removeAvatar = () => {
      if (req?.file) {
        fs.unlink(
          path.join(__dirname, "..", "uploads", req.file.filename),
          () => { }
        );
      }
    };

    // If Fields are Empty Generate Client Error
    if (!name || !email || !password) {
      removeAvatar();
      return sendResponse(res, 400, httpStatusText.FAIL, "All fields are required", null);
    }

    // If name not valid
    if (!NAME_REGEX.test(name)) {
      removeAvatar();
      return sendResponse(
        res,
        400,
        httpStatusText.FAIL,
        `Name must be 4 to 24 characters, Must begin with a letter, Letters, numbers, underscores, hyphens allowed, No spaces.`,
        null
      );
    }

    // If email not valid
    if (!EMAIL_REGEX.test(email)) {
      removeAvatar();
      return sendResponse(res, 400, httpStatusText.FAIL, `Enter valid email.`, null);
    }

    // If password not valid
    if (!PASS_REGEX.test(password)) {
      removeAvatar();
      return sendResponse(
        res,
        400,
        httpStatusText.FAIL,
        `Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %`,
        null
      );
    }

    const user = await UserModel.findOne({ email: email });

    // If User With Same Email Exists Return Conflict
    if (user) {
      removeAvatar();
      return sendResponse(
        res,
        409,
        httpStatusText.FAIL,
        `User with same email already exists`,
        null
      );
    }

    if (req?.file?.filename) {
      await handleImageQuality(req.file.filename, req.file.filename, `png`, 225, 225, 80);
    }

    // Create Hash Password then Create User
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      avatar: req?.file?.filename,
    });

    const accessToken = jwt.sign(
      {
        userInfo: {
          userId: newUser._id,
          roles: newUser.roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Creates Secure Cookie with refreshToken
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: true, // https
      sameSite: "None", // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send User Data to Client
    sendResponse(
      res,
      201,
      httpStatusText.SUCCESS,
      `successful register`,
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: createImagesUrl([newUser.avatar])[0],
        roles: newUser.roles,
        accessToken: accessToken,
      }
    );
  }
);

const login = asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;

    // If Fields are Empty Generate Client Error
    if (!email || !password) {
      return sendResponse(res, 400, httpStatusText.FAIL, "All fields are required", null);
    }

    const user = await UserModel.findOne({ email: email });

    // Check If User not Exists
    if (!user) {
      return sendResponse(res, 404, httpStatusText.FAIL, "User does not exist", null);
    }

    const IsPasswordMatch = await bcrypt.compare(password, user.password);

    // Check If Password not Match
    if (!IsPasswordMatch) {
      return sendResponse(res, 401, httpStatusText.FAIL, "Wrong Password", null);
    }

    const accessToken = jwt.sign(
      {
        userInfo: {
          userId: user._id,
          roles: user.roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    // Creates Secure Cookie with refreshToken
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: true, // https
      sameSite: "None", // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send User Data to Client
    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      `successful login`,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: createImagesUrl([user.avatar])[0],
        roles: user.roles,
        accessToken: accessToken,
      }
    );
  }
);

const refresh = asyncHandler(
  async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return sendResponse(res, 401, httpStatusText.FAIL, "Unauthorized", null);
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    jwt.verify(
      cookies.jwt,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return sendResponse(
            res,
            403,
            httpStatusText.RefreshTokenExpiredError,
            "Forbidden",
            null
          );
        }

        const user = await UserModel.findById(decoded.userId);

        const accessToken = jwt.sign(
          {
            userInfo: {
              userId: user._id,
              roles: user.roles
            }
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
          { userId: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        // Creates Secure Cookie with refresh token
        res.cookie("jwt", refreshToken, {
          httpOnly: true, // accessible only by web server
          secure: true, // https
          sameSite: "None", // cross-site cookie
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send User Data to Client
        sendResponse(
          res,
          200,
          httpStatusText.SUCCESS,
          `successful refresh token`,
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: createImagesUrl([user.avatar])[0],
            roles: user.roles,
            accessToken: accessToken,
          }
        );
      }
    );
  }
);

const logout = asyncHandler(
  async (req, res) => {
    // On client, also delete the accessToken

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "successful logout",
      null
    );
  }
);

module.exports = {
  multerOptions,
  register,
  login,
  refresh,
  logout,
};
