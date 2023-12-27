const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: "users"
    },
    content: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true
  }
);

const ReportModel = mongoose.model("reports", reportSchema);
module.exports = ReportModel;
