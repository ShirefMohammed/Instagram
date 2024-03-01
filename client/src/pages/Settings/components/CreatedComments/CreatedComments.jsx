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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setFetchCommentsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/createdComments?page=${commentsPage}&limit=${commentsLimit}`
        );
        setComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchCommentsLoad(false);
      }
    }
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  return (
    <div className={`${style.created_comments}`}>
      <>
        {
          fetchCommentsLoad && comments.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : comments.length > 0 ?
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

      <>
        {
          fetchCommentsLoad && comments.length === 0 ? ("")

            : fetchCommentsLoad || commentsPage * commentsLimit === comments.length ?
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

              : commentsPage * commentsLimit > comments.length ?
                (<p className={style.no_more_comments_message}>
                  This section has {comments.length} comments
                </p>)

                : ("")
        }
      </>
    </div>
  )
}

export default CreatedComments