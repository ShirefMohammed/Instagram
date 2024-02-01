const sendResponse = (response, statusCode, statusText, message, data) => {
  response.status(statusCode).json({
    status: statusText,
    message: message,
    data: data
  });
};

module.exports = sendResponse;