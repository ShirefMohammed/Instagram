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

  // Remove action
  const removeAction = async (postId) => {
    if (removePostType === "deletePost") {
      await deletePost(postId);
    } else if (removePostType === "unsave") {
      await unsave(postId);
    } else if (removePostType === "unlike") {
      await unlike(postId);
    }
  }

  // Delete post
  const deletePost = async (postId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(`posts/${postId}`);
      const message = res?.data?.message;
      notify("success", message);
      setPosts(posts.filter(item => item._id !== postId));
    }

    catch (err) {
      if (!err?.response) {
        notify("error", 'No Server Response');
      }
      const message = err.response?.data?.message;
      if (message) {
        notify("error", message);
      } else {
        notify("error", "Post not deleted");
      }
    }

    finally {
      setRemoveLoading(false);
    }
  }

  // Unsave post
  const unsave = async (postId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(`posts/${postId}/save`);
      const message = res?.data?.message;
      notify("success", message);
      setPosts(posts.filter(item => item._id !== postId));
    }

    catch (err) {
      if (!err?.response) {
        notify("error", 'No Server Response');
      }
      const message = err.response?.data?.message;
      if (message) {
        notify("error", message);
      } else {
        notify("error", "Post not removed from saved");
      }
    }

    finally {
      setRemoveLoading(false);
    }
  }

  // Unlike post
  const unlike = async (postId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(`posts/${postId}/likes`);
      const message = res?.data?.message;
      notify("success", message);
      setPosts(posts.filter(item => item._id !== postId));
    }

    catch (err) {
      if (!err?.response) {
        notify("error", 'No Server Response');
      }
      const message = err.response?.data?.message;
      if (message) {
        notify("error", message);
      } else {
        notify("error", "Post not removed from liked");
      }
    }

    finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.post_card}>
      {/* Link to the post */}
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

      {/* Remove post btn */}
      <button
        type="button"
        className={style.delete_btn}
        onClick={() => removeAction(post?._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#fff" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>

      {/* Update post link */}
      <>
        {
          removePostType === "deletePost" ?
            (<Link
              to={`/posts/${post?._id}/update`}
              className={style.update_post_link}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>) : ""
        }
      </>
    </div>
  )
}

export default PostCard
