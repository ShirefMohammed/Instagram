/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faComment,
  faHeart
} from "@fortawesome/free-regular-svg-icons";
import {
  useAxiosPrivate,
  useNotify
} from "../../hooks";
import defaultAvatar from "../../assets/defaultAvatar.png";
import style from "./PostCard.module.css";

const PostCard = ({ post }) => {
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();

  // Add like to post
  const addLike = async () => {
    try {
      setLikeLoading(true);
      const res = await axiosPrivate.post(`posts/${post?._id}/likes`);
      notify("success", res?.data?.message);
    } catch (err) {
      if (err?.response?.status === 403) {
        navigate(
          "/authentication",
          { state: { from: location }, replace: true }
        )
      }
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
      if (err?.response?.status === 403) {
        navigate(
          "/authentication",
          { state: { from: location }, replace: true }
        )
      }
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
        <img src={post?.images[0]} alt="post image" />
      </Link>

      {/* Controllers */}
      <div className={style.controllers}>
        <span className={style.post_date}>
          {new Date(post?.createdAt).toISOString().split('T')[0]}
        </span>
        <div className={style.actions}>
          <Link
            to={`/posts/${post?._id}`}
          >
            <FontAwesomeIcon icon={faComment} />
          </Link>
          <button
            type="button"
            onClick={savePost}
          >
            {
              saveLoading ? <PuffLoader color="#000" size={17} />
                : <FontAwesomeIcon icon={faBookmark} />
            }
          </button>
          <button
            type="button"
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
