const httpStatusText = require("../utils/httpStatusText");

const verifyRoles = (allowedRoles) => {
  return (req, res, next) => {
    const roles = req?.userInfo?.roles;

    if (!roles) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Unauthorized",
        data: null
      });
    }

    const isAllowed = roles.some(role => allowedRoles.includes(role));

    if (!isAllowed) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Unauthorized",
        data: null
      });
    } else {
      next();
    }
  }
}

module.exports = verifyRoles;