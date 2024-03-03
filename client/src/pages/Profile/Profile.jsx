import { useEffect, useState, } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faBookmark, faClipboard } from "@fortawesome/free-regular-svg-icons";
import { useAxiosPrivate, useHandleErrors } from "../../hooks";
import ProfileControllers from "./components/ProfileControllers/ProfileControllers";
import PostsViewer from "./components/PostsViewer/PostsViewer";
import DeleteAccount from "./components/DeleteAccount/DeleteAccount";
import style from "./Profile.module.css";
import defaultAvatar from "../../assets/defaultAvatar.png";
import axios from "../../api/axios";

const Profile = () => {
  const userId = useParams().id; // general user id
  const user = useSelector(state => state.user); // current user visitor

  const [userData, setUserData] = useState(false);
  const [fetchUserLoad, setFetchUserLoad] = useState(false);

  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);

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
        const res = await axios.get(`/users/${userId}`);
        setUserData(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUserLoad(false);
      }
    }
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
  }, [userId]);

  // Fetch created posts
  useEffect(() => {
    const fetchCreatedPosts = async () => {
      try {
        setFetchCreatedPostsLoad(true);
        const res = await axios.get(
          `/users/${userId}/createdPosts?page=${createdPostsPage}&limit=${createdPostsLimit}`
        );
        setCreatedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchCreatedPostsLoad(false);
      }
    }
    fetchCreatedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdPostsPage, userId]);

  // Fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setFetchSavedPostsLoad(true);
        if (user?._id != userId) return null;
        const res = await axiosPrivate.get(
          `/users/${userId}/savedPosts?page=${savedPostsPage}&limit=${savedPostsLimit}`
        );
        setSavedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchSavedPostsLoad(false);
      }
    }
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPostsPage, userId]);

  // Fetch liked posts
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        setFetchLikedPostsLoad(true);
        if (user?._id != userId) return null;
        const res = await axiosPrivate.get(
          `/users/${userId}/likedPosts?page=${likedPostsPage}&limit=${likedPostsLimit}`
        );
        setLikedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchLikedPostsLoad(false);
      }
    }
    fetchLikedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedPostsPage, userId]);

  return (
    <>
      {
        fetchUserLoad ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)

          : userData?._id ?
            (<div className={style.user_profile} >
              <div className={style.container}>

                <div className={style.user_info}>
                  <div className={style.image_container}>
                    <img src={userData?.avatar || defaultAvatar} alt="" />
                  </div>

                  <div className={style.top_container}>
                    <div className={style.controllers}>
                      <span className={style.name}>
                        {userData?.name}
                      </span>

                      <ProfileControllers
                        userId={userId}
                        setOpenDeleteAccount={setOpenDeleteAccount}
                      />
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
                        userData?.links && userData.links.map((link) => (
                          <Link key={link} to={link} target="_blank">
                            {link}
                          </Link>
                        ))
                      }
                    </div>
                  </div>
                </div>

                <hr style={{
                  width: "70%",
                  margin: "30px auto",
                  border: "1px solid #ddd",
                  borderBottom: "none"
                }} />

                <div className={style.posts_container}>
                  <ul className={style.controllers}>
                    <li>
                      <button
                        type="button"
                        onClick={() => setPostsType("createdPosts")}
                        className={postsType === "createdPosts" ? style.active : ""}
                      >
                        <FontAwesomeIcon icon={faClipboard} />
                        <span>Posts</span>
                      </button>
                    </li>
                    {
                      (user?._id == userId) ?
                        (<>
                          <li>
                            <button
                              type="button"
                              onClick={() => setPostsType("savedPosts")}
                              className={postsType === "savedPosts" ? style.active : ""}
                            >
                              <FontAwesomeIcon icon={faBookmark} />
                              <span>Saved</span>
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setPostsType("likedPosts")}
                              className={postsType === "likedPosts" ? style.active : ""}
                            >
                              <FontAwesomeIcon icon={faHeart} />
                              <span>Liked</span>
                            </button>
                          </li>
                        </>) : ("")
                    }
                  </ul>

                  <>
                    {
                      postsType === "createdPosts" ?
                        (<PostsViewer
                          posts={createdPosts}
                          limit={createdPostsLimit}
                          page={createdPostsPage}
                          setPage={setCreatedPostsPage}
                          fetchPostsLoad={fetchCreatedPostsLoad}
                          setFetchPostsLoad={setFetchCreatedPostsLoad}
                        />)

                        : user?._id == userId && postsType === "savedPosts" ?
                          (<PostsViewer
                            posts={savedPosts}
                            limit={savedPostsLimit}
                            page={savedPostsPage}
                            setPage={setSavedPostsPage}
                            fetchPostsLoad={fetchSavedPostsLoad}
                            setFetchPostsLoad={setFetchSavedPostsLoad}
                          />)

                          : user?._id == userId && postsType === "likedPosts" ?
                            (<PostsViewer
                              posts={likedPosts}
                              limit={likedPostsLimit}
                              page={likedPostsPage}
                              setPage={setLikedPostsPage}
                              fetchPostsLoad={fetchLikedPostsLoad}
                              setFetchPostsLoad={setFetchLikedPostsLoad}
                            />)

                            : ("")
                    }
                  </>
                </div>

                <>
                  {
                    openDeleteAccount ?
                      (<DeleteAccount setOpenDeleteAccount={setOpenDeleteAccount} />)
                      : ("")
                  }
                </>
              </div>
            </div>)

            : (<div className={style.error_container}>
              Some errors happen when fetching user
            </div>)
      }
    </>
  )
}

export default Profile
