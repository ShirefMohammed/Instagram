const httpStatusText = require("../utils/httpStatusText");

const handleErrors = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: httpStatusText.ERROR,
    message: "Internal server error",
    data: null
  });
};

module.exports = handleErrors;