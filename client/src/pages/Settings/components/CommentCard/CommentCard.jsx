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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openUpdateComment, setOpenUpdateComment] = useState(false);

  const [viewMoreContent, setViewMoreContent] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const deleteComment = async (commentId, postId) => {
    try {
      setDeleteLoading(true);
      await axiosPrivate.delete(
        `posts/${postId}/comments/${commentId}`
      );
      setComments(comments.filter(comment => comment?._id !== commentId));
      notify("success", "comment is deleted");
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className={style.comment_card}>
      <div className={style.content}>
        {
          comment?.content?.length && comment.content.length > 100 ?
            (<>
              <p>
                {
                  viewMoreContent ?
                    comment.content
                    : comment.content.substring(0, 100)
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

            : (<p>{comment?.content}</p>)
        }
      </div>

      <span className={style.created_at}>
        {new Date(comment?.createdAt).toISOString().split('T')[0]}
      </span>

      <Link
        className={style.comment_post_link}
        to={`/posts/${comment?.post?._id}`}
      >
        Go to the post
      </Link>

      <button
        type="button"
        title="delete comment"
        className={style.delete_btn}
        onClick={() => deleteComment(comment?._id, comment?.post?._id)}
        disabled={deleteLoading ? true : false}
        style={deleteLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          deleteLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>

      <button
        type="button"
        className={style.update_btn}
        onClick={() => setOpenUpdateComment(true)}
      >
        Update this comment
      </button>

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
