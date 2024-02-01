const asyncHandler = require("../middleware/asyncHandler");
const ReportModel = require("../models/reportModel");
const ROLES_LIST = require('../utils/roles_list');
const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");

const getReports = asyncHandler(
  async (req, res) => {
    const query = req.query;

    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const skip = (page - 1) * limit;

    const sort = query?.sort || -1;

    const reports = await ReportModel.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "sender",
        select: "_id name email avatar roles"
      })
      .sort({ updatedAt: sort });

    reports.map((report) => {
      report.sender.avatar = new URL(
        report.sender.avatar,
        `${process.env.SERVER_URL}/api/uploads/`
      ).toString();
    }
    );

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching reports",
      reports
    );
  }
);

const createReport = asyncHandler(
  async (req, res) => {
    const userId = req?.userInfo?.userId;
    const content = req.body?.content;

    if (!userId) {
      return sendResponse(res, 401, httpStatusText.FAIL, `Unauthorized`, null);
    }

    if (!content) {
      return sendResponse(res, 400, httpStatusText.FAIL, `report content required`, null);
    }

    const newReport = await ReportModel.create({
      sender: userId,
      content: content,
    });

    sendResponse(
      res,
      201,
      httpStatusText.SUCCESS,
      "report created successfully",
      newReport
    );
  }
);

const handleReportAccess = asyncHandler(
  async (req, res, next) => {
    const userInfo = req?.userInfo;
    const reportId = req?.params?.id;

    if (!userInfo) {
      return sendResponse(res, 401, httpStatusText.FAIL, `Unauthorized`, null);
    }

    if (!reportId) {
      return sendResponse(res, 400, httpStatusText.FAIL, `Report ID required`, null);
    }

    const report = await ReportModel.findById(reportId)
      .populate({ path: "sender", select: "_id name email avatar roles" });

    if (!report) {
      return sendResponse(res, 404, httpStatusText.FAIL, `Report with ID ${req.params.id} not found`, null);
    }

    if (
      !userInfo.roles.includes(ROLES_LIST.Admin)
      && userInfo.userId != report.sender._id
    ) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    report.sender.avatar = `${process.env.SERVER_URL}/api/uploads/${report.sender.avatar}`;

    req.report = report;

    next();
  }
);

const getReport = asyncHandler(
  async (req, res) => {
    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "successful fetching report",
      req.report
    );
  }
);

const updateReport = asyncHandler(
  async (req, res) => {
    if (req?.userInfo?.userId != req?.report?.sender?._id) {
      return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      req.report._id,
      { $set: { ...req.body } },
      { new: true }
    );

    sendResponse(
      res,
      200,
      httpStatusText.SUCCESS,
      "report updated successfully",
      updatedReport
    );
  }
);

const deleteReport = asyncHandler(
  async (req, res) => {
    await ReportModel.deleteOne({ _id: req.report._id });

    sendResponse(
      res,
      204,
      httpStatusText.SUCCESS,
      "report deleted successfully",
      null
    );
  }
);

module.exports = {
  getReports,
  handleReportAccess,
  getReport,
  createReport,
  updateReport,
  deleteReport,
}