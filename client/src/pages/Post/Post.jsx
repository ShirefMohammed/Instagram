/* eslint-disable react/prop-types */
// Modules
import { useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faHeart, faFaceSmile, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faEllipsis, faX } from "@fortawesome/free-solid-svg-icons";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
// Hooks
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../hooks";
// Css style
import style from "./Post.module.css";
// Images
import defaultAvatar from "../../assets/defaultAvatar.png";
// Api axios
import axios from "../../api/axios";

// Main post page
const Post = () => {
  const { id } = useParams(); // Post id

  const [post, setPost] = useState({});
  const [fetchPostLoad, setFetchPostLoad] = useState(false);

  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setFetchPostLoad(true);
        const res = await axios.get(`/posts/${id}`);
        setPost(res?.data?.data || []);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchPostLoad(false);
      }
    }
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add like to post
  const addLike = async () => {
    try {
      setLikeLoading(true);
      const res = await axiosPrivate.post(`posts/${post?._id}/likes`);
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setLikeLoading(false);
    }
  }

  // Save post
  const savePost = async () => {
    try {
      setSaveLoading(true);
      const res = await axiosPrivate.post(`posts/${post?._id}/save`);
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <>
      {
        // While fetching post data
        fetchPostLoad ? (<div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>)

          // Post
          : post?._id ?
            <div className={style.post}>
              <div className={style.container}>
                {/* User Info */}
                <div className={style.header}>
                  <Link
                    to={`/users/${post?.creator?._id}`}
                    className={style.user_info}
                  >
                    <img
                      src={post?.creator?.avatar || defaultAvatar}
                      alt="avatar"
                    />
                    <span>
                      {post?.creator?.name}
                    </span>
                  </Link>
                </div>

                {/* Images */}
                <div className={style.images_container}>
                  {
                    post?.images && post.images.map((image) => (
                      <img
                        key={image}
                        src={image}
                        alt="Post image"
                      />
                    ))
                  }
                </div>

                {/* Controllers */}
                <div className={style.controllers}>
                  {/* Created At */}
                  <span className={style.post_date}>
                    {new Date(post?.createdAt).toISOString().split('T')[0]}
                  </span>

                  {/* Actions */}
                  <div className={style.actions}>
                    {/* Save */}
                    <button
                      type="button"
                      disabled={saveLoading ? true : false}
                      onClick={savePost}
                    >
                      {
                        saveLoading ? <PuffLoader color="#000" size={17} />
                          : <FontAwesomeIcon icon={faBookmark} />
                      }
                    </button>

                    {/* Like */}
                    <button
                      type="button"
                      disabled={likeLoading ? true : false}
                      onClick={addLike}
                    >
                      {
                        likeLoading ? <PuffLoader color="#000" size={17} />
                          : <FontAwesomeIcon icon={faHeart} />
                      }
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className={style.description_container}>
                  {post.content}
                </p>

                {/* Break */}
                <hr style={{
                  width: "60%",
                  margin: "15px auto",
                  border: "1px solid #eee",
                  borderBottom: "none"
                }} />

                {/* Comments */}
                <Comments />
              </div>
            </div>

            // If post not exists
            : (<div className={style.error_container}>
              Some errors happen when fetching post
            </div>)
      }
    </>
  )
}

// Comments Section
const Comments = () => {
  const { id } = useParams(); // Post id

  const [postComments, setPostComments] = useState([]);
  const [fetchCommentsLoad, setFetchCommentsLoad] = useState(false);

  const [commentsPage, setCommentsPage] = useState(1);
  const limit = 5;

  const [newComment, setNewComment] = useState("");
  const [sendCommentLoad, setSendCommentLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const commentsContainerRef = useRef(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [clickOutPickerEvent, setClickOutPickerEvent] = useState(false);

  // Fetch post comments
  useEffect(() => {
    const fetchPostComments = async () => {
      try {
        setFetchCommentsLoad(true);
        const res = await axios.get(
          `/posts/${id}/comments?page=${commentsPage}&limit=${limit}`
        );
        setPostComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
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

  // Send comment
  const sendComment = async (e) => {
    e.preventDefault();

    try {
      setSendCommentLoad(true);
      if (!newComment) return notify("info", "Enter comment content");
      const res = await axiosPrivate.post(
        `posts/${id}/comments`,
        { content: newComment }
      );
      setPostComments(prev => [res?.data?.data, ...prev]);
      commentsContainerRef.current.scrollTo(0, 0);
      notify("success", res?.data?.message);
      setNewComment("");
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setSendCommentLoad(false);
    }
  }

  return (
    <div className={style.comments}>
      {/* Title */}
      <span className={style.title}>
        Comments
      </span>

      {/* Comments container */}
      <div
        className={style.comments_container}
        ref={commentsContainerRef}
      >
        {
          fetchCommentsLoad && postComments.length === 0 ?
            <div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>

            : postComments.length === 0 ?
              <p className={style.no_comments_added}>
                No comments added, you can add first comment
              </p>

              : postComments.length > 0 ?
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

                  {/* Loading More Comments Button */}
                  {
                    // While fetching comments || If there are comments in db
                    fetchCommentsLoad
                      || commentsPage * limit === postComments.length ?
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

                      // If user reaches last comment
                      : commentsPage * limit > postComments.length ?
                        (<p className={style.no_more_comments_message}>
                          This post has {postComments.length} comments
                        </p>)

                        // No thing
                        : ""
                  }
                </>

                : ""
        }
      </div>

      {/* Send comment */}
      <form className={style.send_comment}>
        {/* Textarea input */}
        <textarea
          name="comment"
          id="comment"
          placeholder="Send new comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>

        {/* Emoji picker */}
        <div className={style.emoji}>
          <button
            type="button"
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

        {/* Submit btn */}
        <button
          type="submit"
          className={style.submit_btn}
          disabled={sendCommentLoad ? true : false}
          style={sendCommentLoad ? { cursor: "revert" } : {}}
          onClick={sendComment}
        >
          {
            sendCommentLoad ? <PuffLoader color="#000" size={22} />
              : <FontAwesomeIcon icon={faPaperPlane} />
          }
        </button>
      </form>
    </div>
  )
}

// Comment Card in Comments Container
const CommentCard = (
  {
    comment,
    postComments,
    setPostComments
  }
) => {
  const user = useSelector(state => state.user);

  const [openOptionsList, setOpenOptionsList] = useState(false);
  const [deleteCommentLoad, setDeleteCommentLoad] = useState(false);
  const [openUpdateComment, setOpenUpdateComment] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  // Delete comment
  const deleteComment = async () => {
    try {
      setDeleteCommentLoad(true);
      const res = await axiosPrivate({
        method: 'delete',
        url: `posts/${comment?.post?._id}/comments`,
        data: { commentId: comment?._id }
      });
      setPostComments(
        postComments.filter(c => c?._id !== comment?._id)
      );
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setDeleteCommentLoad(false);
    }
  }

  return (
    <div className={style.comment_card}>
      {/* Top Part */}
      <div className={style.top}>
        {/* User Info */}
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

        {/* Controllers */}
        {
          user?._id && (
            comment?.creator?._id === user._id
            || comment?.post?.creator === user._id
          ) ?
            (<div className={style.controllers}>
              <button
                type="button"
                onClick={() => setOpenOptionsList(prev => !prev)}
              >
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
              {
                openOptionsList &&
                <ul className={`${style.options_list} fade_up`}>
                  {/* Delete Btn */}
                  {
                    comment?.creator?._id === user._id
                      || comment?.post?.creator === user._id ?
                      (<li>
                        <button
                          type="button"
                          disabled={deleteCommentLoad ? true : false}
                          style={deleteCommentLoad ? { cursor: "revert" } : {}}
                          onClick={deleteComment}
                        >
                          <span>
                            Delete comment
                          </span>
                          {
                            deleteCommentLoad &&
                            <PuffLoader color="#000" size={15} />
                          }
                        </button>
                      </li>)
                      : ""
                  }
                  {/* Update Btn */}
                  {
                    comment?.creator?._id === user._id ?
                      (<li>
                        <button
                          type="button"
                          onClick={() => setOpenUpdateComment(true)}
                        >
                          <span>
                            Update comment
                          </span>
                        </button>
                      </li>)
                      : ""
                  }
                </ul>
              }
            </div>)
            : ""
        }
      </div>

      {/* Comment content */}
      <p className={style.content}>
        {comment.content}
      </p>

      {/* Update comment */}
      <>
        {
          openUpdateComment &&
          <UpdateComment
            comment={comment}
            postComments={postComments}
            setPostComments={setPostComments}
            setOpenUpdateComment={setOpenUpdateComment}
          />
        }
      </>
    </div>
  )
}

// Update Comment in Comment Card in Comments Container
const UpdateComment = (
  {
    comment,
    postComments,
    setPostComments,
    setOpenUpdateComment
  }
) => {
  const [content, setContent] = useState(comment?.content);
  const [loading, setLoading] = useState(false);

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  const notify = useNotify();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setErrMsg("");
  }, [content]);

  // Update comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axiosPrivate.patch(
        `posts/${comment?.post?._id}/comments`,
        {
          commentId: comment?._id,
          content: content
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      setPostComments(postComments.map((c) => {
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
          {loading && <MoonLoader color="#fff" size={15} />}
        </button>
      </form>
    </div>
  )
}

export default Post
