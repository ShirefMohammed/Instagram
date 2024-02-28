import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../hooks";
import PostControllers from "./components/PostControllers/PostControllers";
import Comments from "./components/Comments/Comments";
import ROLES_LIST from "../../utils/roles_list";
import defaultAvatar from "../../assets/defaultAvatar.png";
import axios from "../../api/axios";
import style from "./Post.module.css";

const Post = () => {
  const postId = useParams().id;

  const user = useSelector(state => state.user);

  const [post, setPost] = useState({});
  const [fetchPostLoad, setFetchPostLoad] = useState(false);

  const [likeLoad, setLikeLoad] = useState(false);
  const [saveLoad, setSaveLoad] = useState(false);

  const [viewMoreContent, setViewMoreContent] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setFetchPostLoad(true);
        const res = await axios.get(`/posts/${postId}`);
        setPost(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchPostLoad(false);
      }
    }
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addLike = async () => {
    try {
      setLikeLoad(true);
      const res = await axiosPrivate.post(`posts/${postId}/likes`);
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setLikeLoad(false);
    }
  }

  const savePost = async () => {
    try {
      setSaveLoad(true);
      const res = await axiosPrivate.post(`posts/${postId}/save`);
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSaveLoad(false);
    }
  }

  return (
    <>
      {
        fetchPostLoad ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)

          : post?._id ?
            (<div className={style.post}>
              <div className={style.container}>

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

                  <>
                    {
                      (
                        post?.creator?._id === user._id
                        || user?.roles?.includes(ROLES_LIST.Admin)
                      ) ? <PostControllers post={post} />
                        : ("")
                    }
                  </>
                </div>

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

                <div className={style.controllers}>
                  <span className={style.post_date}>
                    {new Date(post?.createdAt).toISOString().split('T')[0]}
                  </span>

                  <div className={style.actions}>
                    <button
                      type="button"
                      disabled={saveLoad ? true : false}
                      onClick={savePost}
                    >
                      {
                        saveLoad ?
                          <PuffLoader color="#000" size={17} />
                          : <FontAwesomeIcon icon={faBookmark} />
                      }
                    </button>

                    <button
                      type="button"
                      disabled={likeLoad ? true : false}
                      onClick={addLike}
                    >
                      {
                        likeLoad ?
                          <PuffLoader color="#000" size={17} />
                          : <FontAwesomeIcon icon={faHeart} />
                      }
                    </button>
                  </div>
                </div>

                <div className={style.content}>
                  {
                    post?.content?.length && post.content.length > 250 ?
                      (<>
                        <p>
                          {
                            viewMoreContent ?
                              post.content
                              : post.content.substring(0, 250)
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

                <Comments />
              </div>
            </div>)

            : ("")
      }
    </>
  )
}

export default Post
