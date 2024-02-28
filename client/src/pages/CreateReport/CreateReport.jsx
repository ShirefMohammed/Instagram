import { useEffect, useRef, useState } from "react";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useNotify } from "../../hooks";
import style from "./CreateReport.module.css";

const CreateReport = () => {
  const errRef = useRef(null);

  const [content, setContent] = useState("");
  const [createReportLoad, setCreateReportLoad] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  useEffect(() => setErrMsg(""), [content]);

  const createReport = async (e) => {
    e.preventDefault();

    try {
      if (content === "") return notify("info", "Enter report content");

      setCreateReportLoad(true);

      const res = await axiosPrivate.post(
        "reports",
        { content: content },
      );

      notify("success", res.data.message);

      setContent("");
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Report is not created');
      errRef.current.focus();
    }

    finally {
      setCreateReportLoad(false);
    }
  }

  return (
    <form
      className={style.create_report}
      onSubmit={createReport}
    >
      <h2>Send report</h2>

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
        placeholder="Report content"
        required={true}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
      </textarea>

      <button
        type='submit'
        disabled={createReportLoad ? true : false}
        style={createReportLoad ? { opacity: .5, cursor: "revert" } : {}}
      >
        <span>Send</span>
        {createReportLoad && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  )
}

export default CreateReport
