const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../utils/roles_list');
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require('../middleware/verifyRoles');
const {
  getReports,
  createReport,
  handleReportAccess,
  getReport,
  updateReport,
  deleteReport,
} = require("../controllers/reportsController");

// getReports is only available for Admin
// createReport is only available for User
// getReport is available for both Admin and report sender
// updateReport is available for only report sender
// deleteReport is available for both Admin and report sender

router.route('/')
  .get(
    verifyJWT,
    verifyRoles([ROLES_LIST.Admin]),
    getReports
  )
  .post(
    verifyJWT,
    verifyRoles([ROLES_LIST.User]),
    createReport
  );

router.route('/:id')
  .get(
    verifyJWT,
    handleReportAccess,
    getReport
  )
  .patch(
    verifyJWT,
    handleReportAccess,
    updateReport
  )
  .delete(
    verifyJWT,
    handleReportAccess,
    deleteReport
  );

module.exports = router;