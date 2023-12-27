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

// getReports is Only Available For Admin
// createReport is Only Available For User
// getReport is Available For Both Admin and Report Sender
// updateReport is Available For Only Report Sender
// deleteReport is Available For Both Admin and Report Sender

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