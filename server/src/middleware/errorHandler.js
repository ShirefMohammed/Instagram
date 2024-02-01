const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");

const handleErrors = (err, req, res, next) => {
  console.error(err);
  sendResponse(res, 500, httpStatusText.ERROR, "Internal server error", null);
};

module.exports = handleErrors;