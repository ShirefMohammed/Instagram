const jwt = require("jsonwebtoken");
const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");

const verifyJWT = async (req, res, next) => {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  // "Bearer token"

  if (!authHeader?.startsWith("Bearer ")) {
    return sendResponse(res, 401, httpStatusText.FAIL, "Unauthorized", null);
  }

  const token = authHeader.split(" ")[1]; // ["Bearer", "token"]

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return sendResponse(res, 403, httpStatusText.ERROR, "Forbidden", null);
      } else {
        req.userInfo = decoded.userInfo;
        next();
      }
    });
};

module.exports = verifyJWT;
