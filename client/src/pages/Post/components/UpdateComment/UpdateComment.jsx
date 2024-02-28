/* eslint-disable react/prop-types */
import { useRef, useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import style from "./UpdateComment.module.css";

const UpdateComment = ({ comment, postComments, setPostComments, setOpenUpdateComment }) => {
  const errRef = useRef(null);

  const [content, setContent] = useState(comment?.content);
  const [updateCommentLoad, setUpdateCommentLoad] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  useEffect(() => setErrMsg(""), [content]);

  const updateComment = async (e) => {
    e.preventDefault();

    try {
      if (!content) return notify("info", "Enter comment content");

      setUpdateCommentLoad(true);

      const res = await axiosPrivate.patch(
        `posts/${comment?.post?._id}/comments/${comment?._id}`,
        { content: content }
      );

      setPostComments(postComments.map((c) => {
        if (c?._id !== comment?._id) {
          return c;
        } else {
          return res.data.data;
        }
      }));

      notify("success", res.data.message);

      setOpenUpdateComment(false)
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Comment is not updated');
      errRef.current.focus();
    }

    finally {
      setUpdateCommentLoad(false);
    }
  }

  return (
    <div className={style.update_comment}>
      <button
        type="button"
        className={style.close_btn}
        onClick={() => setOpenUpdateComment(false)}
      >
        <FontAwesomeIcon icon={faX} />
      </button>

      <form onSubmit={updateComment}>
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
          placeholder="Enter comment content"
          required={true}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <button
          type='submit'
          disabled={updateCommentLoad ? true : false}
          style={updateCommentLoad ? { opacity: .5, cursor: "revert" } : {}}
        >
          <span>Save Updates</span>
          {updateCommentLoad && <MoonLoader color="#000" size={15} />}
        </button>
      </form>
    </div>
  )
}


export default UpdateComment
