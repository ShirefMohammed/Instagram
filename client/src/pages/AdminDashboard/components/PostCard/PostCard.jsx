/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import defaultPostImage from "../../../../assets/defaultPostImage.png";
import style from "./PostCard.module.css";

const PostCard = ({ post, posts, setPosts }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const deletePost = async (postId) => {
    try {
      setDeleteLoading(true);
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
      setDeleteLoading(false);
    }
  }

  return (
    <div className={style.post_card}>
      <Link
        to={`/posts/${post?._id}`}
        title="see post"
        className={style.post_link}
      >
        <img
          src={post?.images[0] || defaultPostImage}
          alt=""
          loading="lazy"
        />
      </Link>

      <button
        type="button"
        title="delete post"
        className={style.delete_btn}
        onClick={() => deletePost(post?._id)}
        disabled={deleteLoading ? true : false}
        style={deleteLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          deleteLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default PostCard
