const allowedOrigins = require("../config/allowedOrigins");
const sendResponse = require("../utils/sendResponse");

const handleCors = (req, res, next) => {
  if (
    allowedOrigins.includes(req.headers.origin)
    || req.url.startsWith("/api/uploads")
    || process.env.NODE_ENV === "development"
  ) {
    next();
  } else {
    sendResponse(res, 403, "Error", "Not allowed by CORS", null);
  }
};

module.exports = handleCors;