/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import style from "./ReportCard.module.css";

const ReportCard = ({ report, reports, setReports }) => {
  const [removeLoading, setRemoveLoading] = useState(false);
  const [viewMoreContent, setViewMoreContent] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const deleteReport = async () => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(`reports/${report?._id}`);
      setReports(reports.filter(item => item?._id !== report?._id));
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(
        err,
        [
          "handleNoServerResponse",
          "handleServerError",
          "handleUnauthorized",
          "handleExpiredRefreshToken",
          "handleNoResourceFound"
        ]
      );
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.report_card}>
      {/* Sender link */}
      <Link
        className={style.sender_profile_link}
        to={`/users/${report.sender._id}`}
      >
        <img
          src={report.sender.avatar}
          alt="sender avatar"
          loading="lazy"
        />
        {report.sender.name}
      </Link>

      {/* Report content */}
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

      {/* Report created at */}
      <span className={style.created_at}>
        {new Date(report?.createdAt).toISOString().split('T')[0]}
      </span>

      {/* View report link */}
      <Link
        className={style.view_report_link}
        to={`/reports/${report?._id}`}
      >
        View the report
      </Link>

      {/* Delete report btn */}
      <button
        type="button"
        className={style.delete_btn}
        onClick={deleteReport}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default ReportCard
