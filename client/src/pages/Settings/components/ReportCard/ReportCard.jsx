/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import style from "./ReportCard.module.css";

const ReportCard = ({ report, reports, setReports }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMoreContent, setViewMoreContent] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const deleteReport = async (reportId) => {
    try {
      setDeleteLoading(true);
      await axiosPrivate.delete(`reports/${reportId}`);
      setReports(reports.filter(report => report?._id !== reportId));
      notify("success", "report is deleted");
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className={style.report_card}>
      <div className={style.content}>
        {
          report.content.length > 250 ?
            (<>
              <p>
                {
                  viewMoreContent ?
                    report.content
                    : report.content.substring(0, 250)
                }
                {
                  viewMoreContent ?
                    (<button
                      type="button"
                      onClick={() => setViewMoreContent(false)}
                    >
                      see less ...
                    </button>)
                    : (<button
                      type="button"
                      onClick={() => setViewMoreContent(true)}
                    >
                      see more ...
                    </button>)
                }
              </p>
            </>)

            : (<p>{report.content}</p>)
        }
      </div>

      <span className={style.created_at}>
        {new Date(report?.createdAt).toISOString().split('T')[0]}
      </span>

      <Link
        className={style.view_report_link}
        to={`/reports/${report?._id}`}
      >
        View the report
      </Link>

      <Link
        className={style.update_report_link}
        to={`/reports/${report?._id}/update`}
      >
        Update the report
      </Link>

      <button
        type="button"
        className={style.delete_btn}
        onClick={() => deleteReport(report?._id)}
        disabled={deleteLoading ? true : false}
        style={deleteLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          deleteLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default ReportCard
