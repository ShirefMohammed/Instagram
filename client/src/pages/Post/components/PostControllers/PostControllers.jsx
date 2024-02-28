/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import style from "./PostControllers.module.css";

const PostControllers = ({ post }) => {
  const user = useSelector(state => state.user);

  const [openOptionsList, setOpenOptionsList] = useState(false);
  const [deletePostLoad, setDeletePostLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();
  const navigate = useNavigate();

  const deletePost = async () => {
    try {
      setDeletePostLoad(true);
      await axiosPrivate.delete(`posts/${post?._id}`);
      notify("success", "Post is deleted");
      navigate("/");
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Post is not deleted");
    }

    finally {
      setDeletePostLoad(false);
    }
  }

  return (
    <div className={style.post_controllers}>
      <button
        type="button"
        onClick={() => setOpenOptionsList(prev => !prev)}
      >
        <FontAwesomeIcon icon={faEllipsis} />
      </button>

      <>
        {
          openOptionsList ?
            (<ul className={`${style.options_list} ${style.fade_up}`}>
              <>
                {
                  (
                    post?.creator?._id === user._id
                    || user?.roles?.includes(ROLES_LIST.Admin)
                  )
                    ? (<li>
                      <button
                        type="button"
                        disabled={deletePostLoad ? true : false}
                        style={deletePostLoad ? { cursor: "revert" } : {}}
                        onClick={deletePost}
                      >
                        <span>Delete the Post</span>
                        {deletePostLoad && <PuffLoader color="#000" size={15} />}
                      </button>
                    </li>)
                    : ("")
                }
              </>

              <>
                {
                  (post?.creator?._id === user._id)
                    ? (<li>
                      <Link to={`/posts/${post?._id}/update`}>
                        <span>Update the post</span>
                      </Link>
                    </li>)
                    : ("")
                }
              </>
            </ul>)

            : ("")
        }
      </>
    </div>
  )
}

export default PostControllers
