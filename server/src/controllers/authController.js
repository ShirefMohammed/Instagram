const path = require("node:path");
const fs = require("node:fs");
const multer = require('multer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const UserModel = require("../models/userModel");
const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");

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

    // Create Hash Password then Create User
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      avatar: req?.file?.filename,
    });

    // Get User Roles to Assign Them With accessToken
    const roles = Object.values(newUser.roles).filter(Boolean);

    const accessToken = jwt.sign(
      {
        userInfo: {
          userId: newUser._id,
          roles: roles
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

    newUser.refreshToken = [refreshToken];
    await newUser.save();

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
      `successful register`,
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: `${process.env.SERVER_URL}/api/uploads/${newUser.avatar}`,
        accessToken: accessToken,
      }
    );
  }
);

const login = asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;

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

    // Get User Roles to Assign Them With accessToken
    const roles = Object.values(user.roles).filter(Boolean);

    const accessToken = jwt.sign(
      {
        userInfo: {
          userId: user._id,
          roles: roles
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

    let refreshTokenArray =
      cookies?.jwt
        ? user.refreshToken.filter(rt => rt !== cookies.jwt)
        : user.refreshToken;

    if (cookies?.jwt) {
      /*
        Scenario added here:
        1) User logs in but never uses RT and does not logout
        2) RT is stolen
        If 1 & 2, reuse detection is needed to clear all RTs when user logs in
      */

      const IsUserFound = await UserModel.findOne({
        refreshToken: { $elemMatch: { $in: [cookies.jwt] } }
      });

      // Detected refresh token reuse!
      if (!IsUserFound) {
        console.log('attempted refresh token reuse at login!')
        // clear out all previous refresh tokens
        refreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
    }

    // Saving refreshToken with current user
    user.refreshToken = [...refreshTokenArray, refreshToken];
    await user.save();

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
        avatar: `${process.env.SERVER_URL}/api/uploads/${user.avatar}`,
        accessToken: accessToken,
      }
    );
  }
);

const refresh = asyncHandler(
  async (req, res) => {
    const cookies = req.cookies;

    // If There is no refreshToken cookies?.jwt
    if (!cookies?.jwt) {
      return sendResponse(res, 401, httpStatusText.FAIL, "Unauthorized", null);
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    const user = await UserModel.findOne({
      refreshToken: { $elemMatch: { $in: [cookies.jwt] } }
    });

    // Detected refresh token reuse!
    if (!user) {
      jwt.verify(
        cookies.jwt,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return sendResponse(res, 403, httpStatusText.ERROR, "Forbidden", null);
          } else {
            console.log('attempted refresh token reuse!');
            const hackedUser = await UserModel.findOne({
              _id: decoded.userId
            });
            hackedUser.refreshToken = [];
            await hackedUser.save();
          }
        }
      );

      return sendResponse(res, 403, httpStatusText.ERROR, "Forbidden", null);
    }

    const refreshTokenArray = user.refreshToken.filter(rt => rt !== cookies.jwt);

    // evaluate jwt
    jwt.verify(
      cookies.jwt,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log('expired refresh token');
          user.refreshToken = [...refreshTokenArray];
          await user.save();
        }

        if (err || user._id != decoded.userId) {
          return sendResponse(res, 403, httpStatusText.ERROR, "Forbidden", null);
        }

        // Refresh token was still valid
        const roles = Object.values(user.roles).filter(Boolean);

        const accessToken = jwt.sign(
          {
            userInfo: {
              userId: user._id,
              roles: roles
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

        // Saving refreshToken with current user
        user.refreshToken = [...refreshTokenArray, refreshToken];
        await user.save();

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
            avatar: `${process.env.SERVER_URL}/api/uploads/${user.avatar}`,
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
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return sendResponse(res, 204, httpStatusText.SUCCESS, "successful logout", null);
    }

    // Is refreshToken in db?
    const user = await UserModel.findOne({
      refreshToken: { $elemMatch: { $in: [cookies.jwt] } }
    });

    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      return sendResponse(res, 204, httpStatusText.SUCCESS, "successful logout", null);
    }

    // Delete refreshToken in db
    user.refreshToken = user.refreshToken.filter(rt => rt !== cookies.jwt);
    await user.save();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return sendResponse(res, 204, httpStatusText.SUCCESS, "successful logout", null);
  }
);

module.exports = {
  multerOptions,
  register,
  login,
  refresh,
  logout,
};
