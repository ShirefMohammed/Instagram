// Modules
import { useEffect, useState } from "react";
import { Link, useParams, } from "react-router-dom";
// Api axios
import { useAxiosPrivate, useHandleErrors } from "../../hooks";
// Css style
import style from "./Report.module.css";

const Report = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosPrivate.get(`reports/${id}`);
        setContent(res?.data?.data?.content || "");
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
        handleErrors.handleUnauthorized(err);
        handleErrors.handleForbidden(err);
        handleErrors.handleNoResourceFound(err);
      }
    }
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.create_report}>
      {/* Page Title */}
      <h2>Report</h2>

      {/* Content */}
      <textarea
        name="content"
        id="content"
        readOnly={true}
        value={content}
      >
      </textarea>

      {/* Edit Link */}
      <Link to={`/reports/${id}/update`}>
        Edit This Report
      </Link>
    </div>
  )
}

export default Report
