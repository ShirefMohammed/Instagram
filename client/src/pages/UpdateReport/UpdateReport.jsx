import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useNotify } from "../../hooks";
import style from "./UpdateReport.module.css";

const CreateReport = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const errRef = useRef();
  const notify = useNotify();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setErrMsg("");
  }, [content]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosPrivate.get(`reports/${id}`);
        setContent(res?.data?.data?.content || "");
      } catch (err) {
        if (!err?.response) {
          navigate(
            '/noServerResponse',
            { state: { from: location }, replace: true }
          );
        } else if (err?.response?.status === 403) {
          navigate(
            '/unauthorized',
            { state: { from: location }, replace: true }
          );
        }
      }
    }
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axiosPrivate.patch(
        `reports/${id}`,
        { content: content },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      const message = response?.data?.message;
      notify("success", message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Post not created');
      errRef.current.focus();
    }

    finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={style.update_report}
      onSubmit={handleSubmit}
    >
      {/* Page Title */}
      <h2>Update report</h2>

      {/* Error Message */}
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

      {/* Content */}
      <textarea
        name="content"
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
      </textarea>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={loading ? true : false}
      >
        <span>Save Updates</span>
        {loading && <MoonLoader color="#fff" size={15} />}
      </button>
    </form>
  )
}

export default CreateReport
