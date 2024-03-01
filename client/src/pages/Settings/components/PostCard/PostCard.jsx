/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import defaultPostImage from "../../../../assets/defaultPostImage.png";
import style from "./PostCard.module.css";

const PostCard = ({ post, removePostType, posts, setPosts }) => {
  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const removeAction = async (postId) => {
    if (removePostType === "deletePost") {
      await deletePost(postId);
    } else if (removePostType === "unsave") {
      await unsave(postId);
    } else if (removePostType === "unlike") {
      await unlike(postId);
    }
  }

  const deletePost = async (postId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`posts/${postId}`);
      notify("success", "post is deleted");
      setPosts(posts.filter(item => item._id !== postId));
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Post is not deleted");
    }

    finally {
      setRemoveLoading(false);
    }
  }

  const unsave = async (postId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`posts/${postId}/save`);
      notify("success", "post is unsaved");
      setPosts(posts.filter(item => item._id !== postId));
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Post is not unsaved");
    }

    finally {
      setRemoveLoading(false);
    }
  }

  const unlike = async (postId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`posts/${postId}/likes`);
      notify("success", "post is removed from liked");
      setPosts(posts.filter(item => item._id !== postId));
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Post is not removed from liked");
    }

    finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.post_card}>
      <Link
        to={`/posts/${post?._id}`}
        className={style.post_link}
      >
        <img
          src={post?.images[0] || defaultPostImage}
          alt="post image"
          loading="lazy"
        />
      </Link>

      <button
        type="button"
        className={style.delete_btn}
        onClick={() => removeAction(post?._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>

      <>
        {
          removePostType === "deletePost" ?
            (<Link
              to={`/posts/${post?._id}/update`}
              className={style.update_post_link}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>) : ("")
        }
      </>
    </div>
  )
}

export default PostCard
