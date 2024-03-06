import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader, PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import CommentCard from "../CommentCard/CommentCard";
import style from "./Comments.module.css";
import axios from "../../../../api/axios";

const Comments = () => {
  const postId = useParams().id;

  const commentsContainerRef = useRef(null);

  const [postComments, setPostComments] = useState([]);
  const [fetchCommentsLoad, setFetchCommentsLoad] = useState(false);

  const limit = 5;
  const [commentsPage, setCommentsPage] = useState(1);

  const [newComment, setNewComment] = useState("");
  const [sendCommentLoad, setSendCommentLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [clickOutPickerEvent, setClickOutPickerEvent] = useState(false);

  useEffect(() => {
    const fetchPostComments = async () => {
      try {
        setFetchCommentsLoad(true);
        const res = await axios.get(
          `/posts/${postId}/comments?page=${commentsPage}&limit=${limit}`
        );
        setPostComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchCommentsLoad(false);
      }
    }
    fetchPostComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  // Handle click event outside picker
  useEffect(() => {
    if (openEmojiPicker == true) {
      setClickOutPickerEvent(true);
    } else {
      setClickOutPickerEvent(false);
    }
  }, [openEmojiPicker]);

  const sendComment = async (e) => {
    e.preventDefault();

    try {
      setSendCommentLoad(true);

      if (!newComment) return notify("info", "Enter comment content");

      const res = await axiosPrivate.post(
        `posts/${postId}/comments`,
        { content: newComment }
      );

      setPostComments(prev => [res.data.data, ...prev]);

      commentsContainerRef.current.scrollTo(0, 0);

      notify("success", res.data.message);

      setNewComment("");
    } catch (err) {
      handleErrors(err);
    } finally {
      setSendCommentLoad(false);
    }
  }

  return (
    <div className={style.comments}>
      <span className={style.title}>Comments</span>

      <div
        className={style.comments_container}
        ref={commentsContainerRef}
      >
        {
          fetchCommentsLoad && postComments.length === 0 ?
            (<div className={style.loading_container}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : postComments.length === 0 ?
              (<p className={style.no_comments_added}>
                No comments added, you can add the first comment
              </p>)

              : postComments.length > 0 ?
                <>
                  <>
                    {
                      postComments.map((comment) => (
                        <CommentCard
                          key={comment._id}
                          comment={comment}
                          postComments={postComments}
                          setPostComments={setPostComments}
                        />
                      ))
                    }
                  </>

                  <>
                    {
                      fetchCommentsLoad || commentsPage * limit === postComments.length ?
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

                        : commentsPage * limit > postComments.length ?
                          (<p className={style.no_more_comments_message}>
                            This post has {postComments.length} comments
                          </p>)

                          : ("")
                    }
                  </>
                </>

                : ("")
        }
      </div>

      <form className={style.send_comment}>
        <textarea
          name="comment"
          id="comment"
          placeholder="Send new comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>

        <div className={style.emoji}>
          <button
            type="button"
            title="emoji"
            onClick={() => setOpenEmojiPicker(prev => !prev)}
          >
            <FontAwesomeIcon icon={faFaceSmile} />
          </button>
          {
            openEmojiPicker && (<div className={style.emoji_container}>
              <Picker
                data={data}
                theme="light"
                onEmojiSelect={(e) => {
                  setNewComment(prev => prev + e.native)
                }}
                onClickOutside={() => {
                  if (clickOutPickerEvent === true) {
                    setOpenEmojiPicker(false)
                  }
                }}
              />
            </div>)
          }
        </div>

        <button
          type="submit"
          title="send"
          className={style.submit_btn}
          disabled={sendCommentLoad ? true : false}
          style={sendCommentLoad ? { cursor: "revert" } : {}}
          onClick={sendComment}
        >
          {
            sendCommentLoad ?
              <PuffLoader color="#000" size={22} />
              : <FontAwesomeIcon icon={faPaperPlane} />
          }
        </button>
      </form>
    </div>
  )
}


export default Comments
