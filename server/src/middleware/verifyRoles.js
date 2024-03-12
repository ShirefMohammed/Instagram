const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");

const verifyRoles = (allowedRoles) => {
  return (req, res, next) => {
    const roles = req?.userInfo?.roles;

    if (!roles) {
      return sendResponse(res, 401, httpStatusText.FAIL, "Unauthorized", null);
    }

    const isAllowed = roles.some(role => allowedRoles.includes(role));

    if (!isAllowed) {
      return sendResponse(res, 401, httpStatusText.FAIL, "Unauthorized", null);
    } else {
      next();
    }
  }
}

module.exports = verifyRoles;