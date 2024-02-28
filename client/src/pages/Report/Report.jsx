import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, } from "react-router-dom";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../hooks";
import style from "./Report.module.css";

const Report = () => {
  const { id } = useParams();

  const [content, setContent] = useState("");

  const [fetchReportLoad, setFetchReportLoad] = useState(false);
  const [deleteReportLoad, setDeleteReportLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setFetchReportLoad(true);
        const res = await axiosPrivate.get(`reports/${id}`);
        setContent(res.data.data.content);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchReportLoad(false);
      }
    }
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteReport = async (reportId) => {
    try {
      setDeleteReportLoad(true);
      await axiosPrivate.delete(`reports/${reportId}`);
      notify("success", "Report is deleted");
      navigate("/");
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Report is not deleted");
    }

    finally {
      setDeleteReportLoad(false);
    }
  }

  return (
    <>
      {
        !fetchReportLoad ?
          (<div className={style.report}>
            <h2>Report</h2>

            <textarea
              name="content"
              id="content"
              readOnly={true}
              value={content}
            ></textarea>

            <Link
              className={style.edit_link}
              to={`/reports/${id}/update`}
            >
              Edit This Report
            </Link>

            <button
              type="button"
              className={style.delete_btn}
              disabled={deleteReportLoad ? true : false}
              style={deleteReportLoad ? { opacity: .5, cursor: "revert" } : {}}
              onClick={() => deleteReport(id)}
            >
              {
                deleteReportLoad ?
                  <PuffLoader color="#000" size={20} />
                  : "Delete This Report"
              }
            </button>
          </div>)

          : (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div >)
      }
    </>
  )
}

export default Report
