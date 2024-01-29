/* eslint-disable react/prop-types */
// Modules
import { useEffect, useState, } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPenToSquare, faBookmark, faClipboard } from "@fortawesome/free-regular-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
// Hooks
import { useAxiosPrivate, useHandleErrors } from "../../hooks";
// Css style
import style from "./Profile.module.css";
// Images
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultPostImage from "../../assets/defaultPostImage.png";
// Api axios
import axios from "../../api/axios";

const PrivateProfile = () => {
  const { id } = useParams(); // general user id
  const user = useSelector(state => state.user); // current user visitor

  const [userData, setUserData] = useState(false);
  const [fetchUserLoad, setFetchUserLoad] = useState(false);

  const createdPostsLimit = 10;
  const [createdPostsPage, setCreatedPostsPage] = useState(1);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [fetchCreatedPostsLoad, setFetchCreatedPostsLoad] = useState(false);

  const savedPostsLimit = 10;
  const [savedPostsPage, setSavedPostsPage] = useState(1);
  const [savedPosts, setSavedPosts] = useState([]);
  const [fetchSavedPostsLoad, setFetchSavedPostsLoad] = useState(false);

  const likedPostsLimit = 10;
  const [likedPostsPage, setLikedPostsPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState([]);
  const [fetchLikedPostsLoad, setFetchLikedPostsLoad] = useState(false);

  const [postsType, setPostsType] = useState("createdPosts");

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchUserLoad(true);
        const res = await axios.get(`/users/${id}`);
        setUserData(res.data.data);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchUserLoad(false);
      }
    }
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Reset states
  useEffect(() => {
    setCreatedPostsPage(1);
    setCreatedPosts([]);

    setSavedPostsPage(1);
    setSavedPosts([]);

    setLikedPostsPage(1);
    setLikedPosts([]);

    setPostsType("createdPosts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch created posts
  useEffect(() => {
    const fetchCreatedPosts = async () => {
      try {
        setFetchCreatedPostsLoad(true);
        const res = await axios.get(
          `/users/${id}/createdPosts?page=${createdPostsPage}&limit=${createdPostsLimit}`
        );
        setCreatedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchCreatedPostsLoad(false);
      }
    }
    fetchCreatedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdPostsPage]);

  // Fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setFetchSavedPostsLoad(true);
        if (user?._id != id) return null;
        const res = await axiosPrivate.get(
          `/users/${id}/savedPosts?page=${savedPostsPage}&limit=${savedPostsLimit}`
        );
        setSavedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchSavedPostsLoad(false);
      }
    }
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPostsPage]);

  // Fetch liked posts
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        setFetchLikedPostsLoad(true);
        if (user?._id != id) return null;
        const res = await axiosPrivate.get(
          `/users/${id}/likedPosts?page=${likedPostsPage}&limit=${likedPostsLimit}`
        );
        setLikedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchLikedPostsLoad(false);
      }
    }
    fetchLikedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedPostsPage]);

  return (
    <>
      {
        // While fetching user data
        fetchUserLoad ? (<div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>)

          // Profile
          : userData?._id ?
            <div className={style.user_profile} >
              <div className={style.container}>
                {/* User Info */}
                <div className={style.user_info}>
                  <div className={style.image_container}>
                    <img src={userData?.avatar || defaultAvatar} alt="avatar" />
                  </div>

                  <div className={style.top_container}>
                    <div className={style.controllers}>
                      <span className={style.name}>
                        {userData?.name}
                      </span>

                      {
                        user?._id === id &&
                        <nav>
                          {/* follow soon */}
                          <Link to={`/users/${id}/update`}>
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </Link>
                          <Link to={`/settings/createdPosts`}>
                            <FontAwesomeIcon icon={faGear} />
                          </Link>
                        </nav>
                      }
                    </div>

                    <p className={style.email}>
                      {userData?.email}
                    </p>
                  </div>

                  <div className={style.bottom_container}>
                    <div className={style.bio}>
                      {userData?.bio || "This account has no bio"}
                    </div>
                    <div className={style.links}>
                      {
                        userData?.links &&
                        userData?.links.map((link) => (
                          <Link key={link} to={link} target="_blank">
                            {link}
                          </Link>
                        ))
                      }
                    </div>
                  </div>
                </div>

                {/* Break */}
                <hr style={{
                  width: "70%",
                  margin: "30px auto",
                  border: "1px solid #ddd",
                  borderBottom: "none"
                }} />

                {/* Posts Container */}
                <div className={style.posts_container}>
                  {/* Controllers */}
                  <ul className={style.controllers}>
                    <li>
                      <button
                        type="button"
                        onClick={() => setPostsType("createdPosts")}
                        className={
                          postsType === "createdPosts" ? style.active : ""
                        }
                      >
                        <FontAwesomeIcon icon={faClipboard} />
                        <span>Posts</span>
                      </button>
                    </li>
                    {user?._id == id ? (<>
                      <li>
                        <button
                          type="button"
                          onClick={() => setPostsType("savedPosts")}
                          className={
                            postsType === "savedPosts" ? style.active : ""
                          }
                        >
                          <FontAwesomeIcon icon={faBookmark} />
                          <span>Saved</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => setPostsType("likedPosts")}
                          className={
                            postsType === "likedPosts" ? style.active : ""
                          }
                        >
                          <FontAwesomeIcon icon={faHeart} />
                          <span>Liked</span>
                        </button>
                      </li>
                    </>) : ""}
                  </ul>

                  {/* Posts cards */}
                  <>
                    {
                      postsType === "createdPosts" ?
                        <PostsViewer
                          posts={createdPosts}
                          limit={createdPostsLimit}
                          page={createdPostsPage}
                          setPage={setCreatedPostsPage}
                          fetchPostsLoad={fetchCreatedPostsLoad}
                          setFetchPostsLoad={setFetchCreatedPostsLoad}
                        />

                        : user?._id == id && postsType === "savedPosts" ?
                          <PostsViewer
                            posts={savedPosts}
                            limit={savedPostsLimit}
                            page={savedPostsPage}
                            setPage={setSavedPostsPage}
                            fetchPostsLoad={fetchSavedPostsLoad}
                            setFetchPostsLoad={setFetchSavedPostsLoad}
                          />

                          : user?._id == id && postsType === "likedPosts" ?
                            <PostsViewer
                              posts={likedPosts}
                              limit={likedPostsLimit}
                              page={likedPostsPage}
                              setPage={setLikedPostsPage}
                              fetchPostsLoad={fetchLikedPostsLoad}
                              setFetchPostsLoad={setFetchLikedPostsLoad}
                            />

                            : ""
                    }
                  </>
                </div>
              </div>
            </div >

            // If post not exists
            : (<div className={style.error_container}>
              Some errors happen when fetching user
            </div>)
      }
    </>
  )
}

// View posts in grids of cards
const PostsViewer = (
  {
    posts,
    limit,
    page,
    setPage,
    fetchPostsLoad,
    setFetchPostsLoad
  }
) => {
  return (
    <div className={style.posts_viewer}>
      {/* Posts viewer section */}
      <>
        {
          // While fetching posts and posts length is 0
          fetchPostsLoad && posts.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If post have been fetched
            : posts?.length && posts.length > 0 ?
              (<div className={style.viewer}>
                {
                  posts?.length && posts.map((post) => (
                    <Link
                      key={post?._id}
                      to={`/posts/${post?._id}`}
                      className={style.post_card}
                    >
                      <img
                        src={post?.images[0] || defaultPostImage}
                        alt="post image"
                      />
                    </Link>
                  ))
                }
              </div>)

              : ""
        }
      </>

      {/* Load more posts btn section */}
      <>
        {
          // While fetching posts || If there are posts in db
          fetchPostsLoad || page * limit === posts.length ?
            (<button
              type="button"
              className={style.load_more_posts_btn}
              disabled={fetchPostsLoad ? true : false}
              style={fetchPostsLoad ? { cursor: "revert" } : {}}
              onClick={() => {
                setFetchPostsLoad(true)
                setPage(prev => prev + 1)
              }}
            >
              {
                fetchPostsLoad ?
                  <PuffLoader color="#000" size={15} />
                  : "More"
              }
            </button>)

            // If user reaches last post
            : page * limit > posts.length ?
              (<p className={style.no_more_posts_message}>
                This section has {posts.length} post
              </p>)

              // No thing
              : ""
        }
      </>
    </div>
  )
}

export default PrivateProfile
