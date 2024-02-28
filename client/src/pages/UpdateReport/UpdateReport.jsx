import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../hooks";
import style from "./UpdateReport.module.css";

const UpdateReport = () => {
  const { id } = useParams();

  const errRef = useRef(null);

  const [content, setContent] = useState("");

  const [fetchReportLoad, setFetchReportLoad] = useState(false);
  const [updateReportLoad, setUpdateReportLoad] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  useEffect(() => setErrMsg(""), [content]);

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

  const updateReport = async (e) => {
    e.preventDefault();

    try {
      if (content === "") return notify("info", "Fill report content");

      setUpdateReportLoad(true);

      const res = await axiosPrivate.patch(
        `reports/${id}`,
        { content: content },
      );

      notify("success", res.data.message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Report is not updated');
      errRef.current.focus();
    }

    finally {
      setUpdateReportLoad(false);
    }
  }

  return (
    <>
      {
        !fetchReportLoad ?
          (<form
            className={style.update_report}
            onSubmit={updateReport}
          >
            <h2>Update report</h2>

            <>
              {
                errMsg &&
                <p
                  ref={errRef}
                  className={style.error_message}
                  aria-live="assertive"
                >
                  {errMsg}
                </p>
              }
            </>

            <textarea
              name="content"
              id="content"
              placeholder="Enter report content"
              value={content}
              required={true}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <button
              type='submit'
              disabled={updateReportLoad ? true : false}
              style={updateReportLoad ? { opacity: .5, cursor: "revert" } : {}}
            >
              <span>Save Updates</span>
              {updateReportLoad && <MoonLoader color="#000" size={15} />}
            </button>
          </form>)

          : (<div className={style.loading_container}>
            < MoonLoader color="#000" size={20} />
          </div >)
      }
    </>
  )
}

export default UpdateReport
