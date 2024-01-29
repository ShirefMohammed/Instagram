/* eslint-disable react/prop-types */
// Modules
import { useState } from "react";
import {
  Link,
} from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faComment,
  faHeart
} from "@fortawesome/free-regular-svg-icons";
// Hooks
import {
  useAxiosPrivate,
  useHandleErrors,
  useNotify
} from "../../hooks";
// Css style
import style from "./PostCard.module.css";
// Images
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultPostImage from "../../assets/defaultPostImage.png";

const PostCard = ({ post }) => {
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
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
      handleErrors.handleNoResourceFound(err);
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
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
      handleErrors.handleNoResourceFound(err);
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
          <Link
            to={`/posts/${post?._id}`}
          >
            <FontAwesomeIcon icon={faComment} />
          </Link>
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
      <Link
        to={`/posts/${post?._id}`}
        className={style.description_container}
      >
        {
          post?.content?.length && post.content.length > 100 ?
            <p>{post.content.substr(0, 100)}... more</p>
            : post?.content?.length && post.content.length > 0 ?
              <p>{post.content}</p>
              : ""
        }
      </Link>
    </div>
  )
}

export default PostCard
