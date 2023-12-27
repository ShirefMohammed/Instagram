const jwt = require("jsonwebtoken");
const httpStatusText = require("../utils/httpStatusText");

const verifyJWT = async (req, res, next) => {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  // "Bearer token"

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      status: httpStatusText.ERROR,
      message: "Unauthorized",
      data: null
    });
  }

  const token = authHeader.split(" ")[1]; // ["Bearer", "token"]

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(403).json({
          status: httpStatusText.ERROR,
          message: "Forbidden",
          data: null
        });
      } else {
        req.userInfo = decoded.userInfo;
        next();
      }
    });
};

module.exports = verifyJWT;
