import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import CommentCard from "../CommentCard/CommentCard";
import style from "./CreatedComments.module.css";

const CreatedComments = () => {
  const user = useSelector(state => state.user);

  const commentsLimit = 10;
  const [commentsPage, setCommentsPage] = useState(1);

  const [comments, setComments] = useState([]);
  const [fetchCommentsLoad, setFetchCommentsLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setFetchCommentsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/createdComments?page=${commentsPage}&limit=${commentsLimit}`
        );
        setComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(
          err,
          [
            "handleNoServerResponse",
            "handleServerError",
            "handleUnauthorized",
            "handleExpiredRefreshToken",
            "handleNoResourceFound"
          ]
        );
      } finally {
        setFetchCommentsLoad(false);
      }
    }
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  return (
    <div className={`${style.created_comments}`}>
      {/* Created comments section */}
      <>
        {
          // While fetching comments and comments length is 0
          fetchCommentsLoad && comments.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If comments have been fetched
            : comments?.length && comments.length > 0 ?
              (<div className={style.viewer}>
                {
                  comments.map((comment) => (
                    <CommentCard
                      key={comment._id}
                      comment={comment}
                      comments={comments}
                      setComments={setComments}
                    />
                  ))
                }
              </div>)

              : ("")
        }
      </>

      {/* Load more comments btn section */}
      <>
        {
          fetchCommentsLoad && comments.length === 0 ? ("")

            // While fetching comments || If there are comments in db
            : fetchCommentsLoad
              || commentsPage * commentsLimit === comments.length ?
              (<button
                type="button"
                className={style.load_more_comments_btn}
                disabled={fetchCommentsLoad ? true : false}
                style={fetchCommentsLoad ? { cursor: "revert" } : {}}
                onClick={() => {
                  setFetchCommentsLoad(true)
                  setCommentsPage(prev => prev + 1)
                }}
              >
                {
                  fetchCommentsLoad ?
                    <PuffLoader color="#000" size={15} />
                    : "More"
                }
              </button>)

              // If comments reaches last comment
              : commentsPage * commentsLimit > comments.length ?
                (<p className={style.no_more_comments_message}>
                  This section has {comments.length} comments
                </p>)

                // No thing
                : ("")
        }
      </>
    </div>
  )
}

export default CreatedComments
