/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import UpdateComment from "../UpdateComment/UpdateComment";
import ROLES_LIST from "../../../../utils/roles_list";
import style from "./CommentCard.module.css";
import defaultAvatar from "../../../../assets/defaultAvatar.png";

const CommentCard = ({ comment, postComments, setPostComments }) => {
  const user = useSelector(state => state.user);

  const [openOptionsList, setOpenOptionsList] = useState(false);
  const [deleteCommentLoad, setDeleteCommentLoad] = useState(false);
  const [openUpdateComment, setOpenUpdateComment] = useState(false);

  const [viewMoreContent, setViewMoreContent] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const deleteComment = async () => {
    try {
      setDeleteCommentLoad(true);

      const res = await axiosPrivate.delete(
        `posts/${comment?.post?._id}/comments/${comment?._id}`
      );

      setPostComments(
        postComments.filter(c => c?._id !== comment?._id)
      );

      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteCommentLoad(false);
    }
  }

  return (
    <div className={style.comment_card}>

      <div className={style.top}>
        <Link
          to={`/users/${comment?.creator?._id}`}
          className={style.user_info}
        >
          <img
            src={comment?.creator?.avatar || defaultAvatar}
            alt="avatar"
          />
          <span>
            {comment?.creator?.name}
          </span>
        </Link>

        <>
          {
            (
              user?._id
              && (
                comment?.creator?._id === user._id
                || comment?.post?.creator === user._id
                || user?.roles?.includes(ROLES_LIST.Admin)
              )
            ) ?
              (<div className={style.comment_controllers}>
                <button
                  type="button"
                  onClick={() => setOpenOptionsList(prev => !prev)}
                >
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>

                <>
                  {
                    openOptionsList ?
                      (<ul className={`${style.options_list} ${style.fade_up}`}>
                        <>
                          {
                            (
                              comment?.creator?._id === user._id
                              || comment?.post?.creator === user._id
                              || user?.roles?.includes(ROLES_LIST.Admin)
                            ) ?
                              (<li>
                                <button
                                  type="button"
                                  disabled={deleteCommentLoad ? true : false}
                                  style={deleteCommentLoad ? { cursor: "revert" } : {}}
                                  onClick={deleteComment}
                                >
                                  <span>Delete comment</span>
                                  {deleteCommentLoad && <PuffLoader color="#000" size={15} />}
                                </button>
                              </li>)
                              : ("")
                          }
                        </>

                        <>
                          {
                            (comment?.creator?._id === user._id) ?
                              (<li>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenUpdateComment(true);
                                    setOpenOptionsList(false);
                                  }}
                                >
                                  <span>Update comment</span>
                                </button>
                              </li>)
                              : ("")
                          }
                        </>
                      </ul>)
                      : ("")
                  }
                </>
              </div>)

              : ("")
          }
        </>
      </div>

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

      <>
        {
          openUpdateComment ?
            (<UpdateComment
              comment={comment}
              postComments={postComments}
              setPostComments={setPostComments}
              setOpenUpdateComment={setOpenUpdateComment}
            />) : ("")
        }
      </>
    </div>
  )
}


export default CommentCard
