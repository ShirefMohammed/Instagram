import { useEffect, useRef, useState } from "react";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useNotify } from "../../hooks";
import style from "./CreateReport.module.css";

const CreateReport = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const errRef = useRef();
  const notify = useNotify();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setErrMsg("");
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axiosPrivate.post(
        "reports",
        { content: content },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      const message = response?.data?.message;
      notify("success", message);

      setContent("");
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
      className={style.create_report}
      onSubmit={handleSubmit}
    >
      {/* Page Title */}
      <h2>Send report</h2>

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
        placeholder="Enter your report"
        required={true}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
      </textarea>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={loading ? true : false}
      >
        <span>Send</span>
        {loading && <MoonLoader color="#fff" size={15} />}
      </button>
    </form>
  )
}

export default CreateReport
