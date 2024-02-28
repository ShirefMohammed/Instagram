/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import style from "./UpdateComment.module.css";

const UpdateComment = (
  {
    comment,
    comments,
    setComments,
    setOpenUpdateComment
  }
) => {
  const [content, setContent] = useState(comment?.content);
  const [loading, setLoading] = useState(false);

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  const notify = useNotify();
  const axiosPrivate = useAxiosPrivate();

  // Reset error message
  useEffect(() => {
    setErrMsg("");
  }, [content]);

  // Update comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axiosPrivate.patch(
        `posts/${comment?.post?._id}/comments/${comment?._id}`,
        {
          content: content
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      setComments(comments.map((c) => {
        if (c?._id !== comment?._id) {
          return c;
        } else {
          return res?.data?.data;
        }
      }));

      notify("success", res?.data?.message);
      setOpenUpdateComment(false)
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Comment not updated');
      errRef.current.focus();
    }

    finally {
      setLoading(false);
    }
  }

  return (
    <div className={style.update_comment}>
      {/* Close Btn */}
      <button
        type="button"
        className={style.close_btn}
        onClick={() => setOpenUpdateComment(false)}
      >
        <FontAwesomeIcon icon={faX} />
      </button>

      {/* Update form */}
      <form onSubmit={handleSubmit}>
        {/* Error Message */}
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

        {/* Content */}
        <textarea
          name="content"
          id="content"
          required={true}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        {/* Submit btn */}
        <button
          type='submit'
          disabled={loading ? true : false}
          style={loading ? { opacity: .5, cursor: "revert" } : {}}
        >
          <span>Save Updates</span>
          {loading && <MoonLoader color="#000" size={15} />}
        </button>
      </form>
    </div>
  )
}

export default UpdateComment
