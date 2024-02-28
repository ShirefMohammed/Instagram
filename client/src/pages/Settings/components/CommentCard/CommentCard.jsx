/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import UpdateComment from "../UpdateComment/UpdateComment";
import style from "./CommentCard.module.css";

const CommentCard = ({ comment, comments, setComments }) => {
  const [removeLoading, setRemoveLoading] = useState(false);
  const [openUpdateComment, setOpenUpdateComment] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // Delete comment
  const deleteComment = async (commentId, postId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(
        `posts/${postId}/comments/${commentId}`
      );
      setComments(comments.filter(comment => comment?._id !== commentId));
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.comment_card}>
      {/* Comment content */}
      <p className={style.content}>
        {comment.content}
      </p>

      {/* Comment created at */}
      <span className={style.created_at}>
        {new Date(comment?.createdAt)
          .toISOString().split('T')[0]}
      </span>

      {/* Link to the post that has the comment */}
      <Link
        className={style.comment_post_link}
        to={`/posts/${comment?.post}`}
      >
        Go to the post
      </Link>

      {/* Remove comment btn */}
      <button
        type="button"
        className={style.delete_btn}
        onClick={() => {
          deleteComment(comment?._id, comment?.post)
        }}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>

      {/* Update comment btn */}
      <button
        type="button"
        className={style.update_btn}
        onClick={() => setOpenUpdateComment(true)}
      >
        Update this comment
      </button>

      {/* Update comment component */}
      <>
        {
          openUpdateComment ?
            (<UpdateComment
              comment={comment}
              comments={comments}
              setComments={setComments}
              setOpenUpdateComment={setOpenUpdateComment}
            />) : ("")
        }
      </>
    </div>
  )
}

export default CommentCard
