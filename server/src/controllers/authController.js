const path = require("node:path");
const fs = require("node:fs");
const multer = require('multer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const UserModel = require("../models/userModel");
const httpStatusText = require("../utils/httpStatusText");

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

const register = asyncHandler(
  async (req, res) => {
    const { name, email, password } = req.body;

    // If Fields are Empty Generate Client Error
    if (!name || !email || !password) {
      if (req?.file) {
        fs.unlink(
          path.join(__dirname, "..", "uploads", req.file.filename),
          () => { }
        );
      }
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "All fields are required",
        data: null
      });
    }

    const user = await UserModel.findOne({ email: email });

    // If User With Same Email Exists Return Conflict
    if (user) {
      if (req?.file) {
        fs.unlink(
          path.join(__dirname, "..", "uploads", req.file.filename),
          () => { }
        );
      }
      return res.status(409).json({
        status: httpStatusText.ERROR,
        message: "User with same email already exists",
        data: null
      });
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
    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful register",
      data: { 
        name: newUser.name,
        email: newUser.email,
        avatar: `${process.env.SERVER_URL}/api/uploads/${newUser.avatar}`,
        accessToken: accessToken,
      }
    });
  }
);

const login = asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;

    // If Fields are Empty Generate Client Error
    if (!email || !password) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "All fields are required",
        data: null
      });
    }

    const user = await UserModel.findOne({ email: email });

    // Check If User Exists
    if (!user) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "User does not exist",
        data: null
      });
    }

    const IsPasswordMatch = await bcrypt.compare(password, user.password);

    // Check If Password Match
    if (!IsPasswordMatch) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Wrong Password",
        data: null
      });
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
    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful login",
      data: {
        name: user.name,
        email: user.email,
        avatar: `${process.env.SERVER_URL}/api/uploads/${user.avatar}`,
        accessToken: accessToken,
      }
    });
  }
);

const refresh = asyncHandler(
  async (req, res) => {
    const cookies = req.cookies;

    // If There is no refreshToken cookies?.jwt
    if (!cookies?.jwt) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Unauthorized",
        data: null
      });
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
            return res.status(403).json({
              status: httpStatusText.ERROR,
              message: "Forbidden",
              data: null
            });
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

      return res.status(403).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
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

        if (err || user._id != decoded.userId)
          return res.status(403).json({
            status: httpStatusText.ERROR,
            message: "Forbidden",
            data: null
          });

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
        res.json({
          status: httpStatusText.SUCCESS,
          message: "successful refresh token",
          data: {
            name: user.name,
            email: user.email,
            avatar: `${process.env.SERVER_URL}/api/uploads/${user.avatar}`,
            accessToken: accessToken,
          }
        });
      }
    );
  }
);

const logout = asyncHandler(
  async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.json({
        status: httpStatusText.SUCCESS,
        message: "successful logout",
        data: null
      });
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

      return res.json({
        status: httpStatusText.SUCCESS,
        message: "successful logout",
        data: null
      });
    }

    // Delete refreshToken in db
    user.refreshToken = user.refreshToken.filter(rt => rt !== cookies.jwt);
    await user.save();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful logout",
      data: null
    });
  }
);

module.exports = {
  multerOptions,
  register,
  login,
  refresh,
  logout,
};
