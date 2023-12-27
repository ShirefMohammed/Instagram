const asyncHandler = require("../middleware/asyncHandler");
const ReportModel = require("../models/reportModel");
const ROLES_LIST = require('../utils/roles_list');
const httpStatusText = require("../utils/httpStatusText");

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
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "successful fetching reports",
      data: reports
    });
  }
);

const createReport = asyncHandler(
  async (req, res) => {
    const userId = req?.userInfo?.userId;
    const content = req.body?.content;

    if (!userId) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Unauthorized",
        data: null
      });
    }

    if (!content) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: "report content required",
        data: null
      });
    }

    const newReport = await ReportModel.create({
      sender: userId,
      content: content,
    });

    res.json({
      status: httpStatusText.SUCCESS,
      message: "report created successfully",
      data: newReport
    });
  }
);

const handleReportAccess = asyncHandler(
  async (req, res, next) => {
    const userInfo = req?.userInfo;
    const reportId = req?.params?.id;

    if (!userInfo) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: 'Unauthorized',
        data: null
      });
    }

    if (!reportId) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        message: 'Report ID required',
        data: null
      });
    }

    const report = await ReportModel.findById(reportId)
      .populate({ path: "sender", select: "_id name email avatar roles" });

    if (!report) {
      return res.status(404).json({
        status: httpStatusText.ERROR,
        message: `Report with ID ${req.params.id} not found`,
        data: null
      });
    }

    if (
      !userInfo.roles.includes(ROLES_LIST.Admin)
      && userInfo.userId != report.sender._id
    ) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    report.sender.avatar = `${process.env.SERVER_URL}/api/uploads/${report.sender.avatar}`;

    req.report = report;

    next();
  }
);

const getReport = asyncHandler(
  async (req, res) => {
    res.json(req.report);
  }
);

const updateReport = asyncHandler(
  async (req, res) => {
    if (req?.userInfo?.userId != req?.report?.sender?._id) {
      return res.status(401).json({
        status: httpStatusText.ERROR,
        message: "Forbidden",
        data: null
      });
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      req.report._id,
      { $set: { ...req.body } },
      { new: true }
    );

    res.json({
      status: httpStatusText.SUCCESS,
      message: "report updated successfully",
      data: updatedReport
    });
  }
);

const deleteReport = asyncHandler(
  async (req, res) => {
    await ReportModel.deleteOne({ _id: req.report._id });
    res.json({
      status: httpStatusText.SUCCESS,
      message: "report deleted successfully",
      data: null
    });
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