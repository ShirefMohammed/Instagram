/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faHeart } from "@fortawesome/free-regular-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../hooks";
import style from "./PostCard.module.css";
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultPostImage from "../../assets/defaultPostImage.png";

const PostCard = ({ post }) => {
  const [viewMoreContent, setViewMoreContent] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  // Add like to post
  const addLike = async () => {
    try {
      setLikeLoading(true);
      const res = await axiosPrivate.post(`posts/${post?._id}/likes`);
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setLikeLoading(false);
    }
  }

  // Save post
  const savePost = async () => {
    try {
      setSaveLoading(true);
      const res = await axiosPrivate.post(`posts/${post?._id}/save`);
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className={style.post_card}>
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
          <span>{post?.creator?.name}</span>
        </Link>
      </div>

      {/* Image */}
      <Link
        to={`/posts/${post?._id}`}
        className={style.image_container}
      >
        <img
          src={post?.images[0] || defaultPostImage}
          alt="post image"
          loading="lazy"
        />
      </Link>

      {/* Controllers */}
      <div className={style.controllers}>
        {/* Created At */}
        <span className={style.post_date}>
          {new Date(post?.createdAt).toISOString().split('T')[0]}
        </span>

        {/* Actions */}
        <div className={style.actions}>
          {/* Comments */}
          <Link to={`/posts/${post?._id}`}>
            <FontAwesomeIcon icon={faComment} />
          </Link>
          {/* Save */}
          <button
            type="button"
            disabled={saveLoading ? true : false}
            onClick={savePost}
          >
            {
              saveLoading ?
                <PuffLoader color="#000" size={17} />
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
              likeLoading ?
                <PuffLoader color="#000" size={17} />
                : <FontAwesomeIcon icon={faHeart} />
            }
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={style.content}>
        {
          post?.content?.length && post.content.length > 100 ?
            (<>
              <p>
                {
                  viewMoreContent ?
                    post.content
                    : post.content.substring(0, 100)
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

            : (<p>{post?.content}</p>)
        }
      </div>
    </div>
  )
}

export default PostCard
