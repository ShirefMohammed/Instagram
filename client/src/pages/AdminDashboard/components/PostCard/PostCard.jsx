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
  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const deletePost = async (postId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(`posts/${postId}`);
      notify("success", res.data.message);
      setPosts(posts.filter(item => item._id !== postId));
    } 
    
    catch (err) {
      if (!err?.response) {
        notify("error", 'No Server Response');
      } else {
        const message = err.response?.data?.message;
        if (message) {
          notify("error", message);
        } else {
          notify("error", "Post is not deleted");
        }
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
        onClick={() => deletePost(post?._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#fff" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default PostCard
