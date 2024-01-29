/* eslint-disable react/prop-types */
// Modules
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
// Hooks
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../hooks";
// Css style
import style from "./Settings.module.css";
// Images
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultPostImage from "../../assets/defaultPostImage.png";
// Api axios
import axios from "../../api/axios";

// Main Page
const Settings = () => {
  const { tab } = useParams();

  return (
    <div className={style.settings}>
      {/* Page Title */}
      <h2>My Settings</h2>

      {/* Controllers */}
      <div className={style.header}>
        <Controllers />
      </div>

      {/* Break */}
      <hr style={{
        width: "60%",
        margin: "25px auto",
        border: "1px solid #eee",
        borderBottom: "none"
      }} />

      {/* Current Section */}
      <div className={style.current_section}>
        {
          tab === "createdPosts" ?
            <CreatedPosts />

            : tab === "savedPosts" ?
              <SavedPosts />

              : tab === "likedPosts" ?
                <LikedPosts />

                : tab === "followings" ?
                  <Followings />

                  : tab === "followers" ?
                    <Followers />

                    : tab === "createdComments" ?
                      <CreatedComments />

                      : tab === "reports" ?
                        <Reports />

                        : ""
        }
      </div>
    </div>
  )
}

// Controllers - header links
const Controllers = () => {
  const { tab } = useParams();

  return (
    <nav className={style.controllers}>
      <Link
        to={`/settings/createdPosts`}
        className={tab === "createdPosts" ? style.active : ""}
      >
        created posts
      </Link>
      <Link
        to={`/settings/savedPosts`}
        className={tab === "savedPosts" ? style.active : ""}
      >
        saved posts
      </Link>
      <Link
        to={`/settings/likedPosts`}
        className={tab === "likedPosts" ? style.active : ""}
      >
        liked posts
      </Link>
      <Link
        to={`/settings/followings`}
        className={tab === "followings" ? style.active : ""}
      >
        followings
      </Link>
      <Link
        to={`/settings/followers`}
        className={tab === "followers" ? style.active : ""}
      >
        followers
      </Link>
      <Link
        to={`/settings/createdComments`}
        className={tab === "createdComments" ? style.active : ""}
      >
        created comments
      </Link>
      <Link
        to={`/settings/reports`}
        className={tab === "reports" ? style.active : ""}
      >
        reports
      </Link>
    </nav>
  )
}

// Created posts
const CreatedPosts = () => {
  const user = useSelector(state => state.user);

  const createdPostsLimit = 10;
  const [createdPostsPage, setCreatedPostsPage] = useState(1);

  const [createdPosts, setCreatedPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const removePostType = "deletePost";
  const handleErrors = useHandleErrors();

  // Fetch created posts
  useEffect(() => {
    const createdPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axios.get(
          `/users/${user?._id}/createdPosts?page=${createdPostsPage}&limit=${createdPostsLimit}`
        );
        setCreatedPosts(prev => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    createdPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdPostsPage]);

  return (
    <div className={`${style.created_posts}`}>
      {/* Posts cards */}
      <PostsViewer
        posts={createdPosts}
        setPosts={setCreatedPosts}
        limit={createdPostsLimit}
        page={createdPostsPage}
        setPage={setCreatedPostsPage}
        fetchPostsLoad={fetchPostsLoad}
        setFetchPostsLoad={setFetchPostsLoad}
        removePostType={removePostType}
      />
    </div>
  )
}

// Saved posts
const SavedPosts = () => {
  const user = useSelector(state => state.user);

  const savedPostsLimit = 10;
  const [savedPostsPage, setSavedPostsPage] = useState(1);

  const [savedPosts, setSavedPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const removePostType = "unsave";

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/savedPosts?page=${savedPostsPage}&limit=${savedPostsLimit}`
        );
        setSavedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPostsPage]);

  return (
    <div className={`${style.saved_posts}`}>
      {/* Posts cards */}
      <PostsViewer
        posts={savedPosts}
        setPosts={setSavedPosts}
        limit={savedPostsLimit}
        page={savedPostsPage}
        setPage={setSavedPostsPage}
        fetchPostsLoad={fetchPostsLoad}
        setFetchPostsLoad={setFetchPostsLoad}
        removePostType={removePostType}
      />
    </div>
  )
}

// Liked posts
const LikedPosts = () => {
  const user = useSelector(state => state.user);

  const likedPostsLimit = 10;
  const [likedPostsPage, setLikedPostsPage] = useState(1);

  const [likedPosts, setLikedPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const removePostType = "unlike";

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch liked posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/likedPosts?page=${likedPostsPage}&limit=${likedPostsLimit}`
        );
        setLikedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedPostsPage]);

  return (
    <div className={`${style.liked_posts}`}>
      {/* Posts cards */}
      <PostsViewer
        posts={likedPosts}
        setPosts={setLikedPosts}
        limit={likedPostsLimit}
        page={likedPostsPage}
        setPage={setLikedPostsPage}
        fetchPostsLoad={fetchPostsLoad}
        setFetchPostsLoad={setFetchPostsLoad}
        removePostType={removePostType}
      />
    </div>
  )
}

// Post viewer
const PostsViewer = (
  {
    posts,
    setPosts,
    limit,
    page,
    setPage,
    fetchPostsLoad,
    setFetchPostsLoad,
    removePostType
  }
) => {
  return (
    <div className={`${style.posts_viewer}`}>
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
                    <PostCard
                      key={post?._id}
                      post={post}
                      removePostType={removePostType}
                      posts={posts}
                      setPosts={setPosts}
                    />
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

// Post card
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
      <Link to={`/posts/${post?._id}`}>
        <img
          src={post?.images[0] || defaultPostImage}
          alt="post image"
        />
      </Link>
      {/* Remove btn */}
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
    </div>
  )
}

// Followings
const Followings = () => {
  const user = useSelector(state => state.user);

  const usersLimit = 10;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(false);

  const removeUserType = "unfollow";
  const handleErrors = useHandleErrors();

  // Fetch followings
  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axios.get(
          `/users/${user?._id}/followings?page=${usersPage}&limit=${usersLimit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchUsersLoad(false);
      }
    }
    fetchFollowings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.followings}`}>
      {/* Users cards */}
      <UsersViewer
        users={users}
        setUsers={setUsers}
        limit={usersLimit}
        page={usersPage}
        setPage={setUsersPage}
        fetchUsersLoad={fetchUsersLoad}
        setFetchUsersLoad={setFetchUsersLoad}
        removeUserType={removeUserType}
      />
    </div>
  )
}

// Followers
const Followers = () => {
  const user = useSelector(state => state.user);

  const usersLimit = 10;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(false);

  const removeUserType = "removeFollower";
  const handleErrors = useHandleErrors();

  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axios.get(
          `/users/${user?._id}/followers?page=${usersPage}&limit=${usersLimit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchUsersLoad(false);
      }
    }
    fetchFollowers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.followers}`}>
      {/* Users cards */}
      <UsersViewer
        users={users}
        setUsers={setUsers}
        limit={usersLimit}
        page={usersPage}
        setPage={setUsersPage}
        fetchUsersLoad={fetchUsersLoad}
        setFetchUsersLoad={setFetchUsersLoad}
        removeUserType={removeUserType}
      />
    </div>
  )
}

// Users viewer
const UsersViewer = (
  {
    users,
    setUsers,
    limit,
    page,
    setPage,
    fetchUsersLoad,
    setFetchUsersLoad,
    removeUserType
  }
) => {
  return (
    <div className={`${style.users_viewer}`}>
      {/* Users viewer section */}
      <>
        {
          // While fetching users and users length is 0
          fetchUsersLoad && users.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If users have been fetched
            : users?.length && users.length > 0 ?
              (<div className={style.viewer}>
                {
                  users?.length && users.map((userData) => (
                    <UserCard
                      key={userData?._id}
                      userData={userData}
                      removeUserType={removeUserType}
                      users={users}
                      setUsers={setUsers}
                    />
                  ))
                }
              </div>)

              : ""
        }
      </>

      {/* Load more users btn section */}
      <>
        {
          // While fetching users || If there are users in db
          fetchUsersLoad || page * limit === users.length ?
            (<button
              type="button"
              className={style.load_more_users_btn}
              disabled={fetchUsersLoad ? true : false}
              style={fetchUsersLoad ? { cursor: "revert" } : {}}
              onClick={() => {
                setFetchUsersLoad(true)
                setPage(prev => prev + 1)
              }}
            >
              {
                fetchUsersLoad ?
                  <PuffLoader color="#000" size={15} />
                  : "More"
              }
            </button>)

            // If user reaches last user
            : page * limit > users.length ?
              (<p className={style.no_more_users_message}>
                This section has {users.length} users
              </p>)

              // No thing
              : ""
        }
      </>
    </div>
  )
}

// User card
const UserCard = ({ userData, removeUserType, users, setUsers }) => {
  const user = useSelector(state => state.user);
  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  // Remove action
  const removeAction = async (userId) => {
    if (removeUserType === "unfollow") {
      await unfollow(userId);
    } else if (removeUserType === "removeFollower") {
      await removeFollower(userId);
    }
  }

  // unfollow user
  const unfollow = async (removedFollowingId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate({
        method: 'delete',
        url: `users/${user?._id}/followings`,
        data: { removedFollowingId: removedFollowingId }
      });
      setUsers(users.filter(item => item._id !== removedFollowingId));
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  // removeFollower
  const removeFollower = async (removedFollowerId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate({
        method: 'delete',
        url: `users/${user?._id}/followers`,
        data: { removedFollowerId: removedFollowerId }
      });
      setUsers(users.filter(item => item._id !== removedFollowerId));
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.user_card}>
      {/* Link to the user */}
      <Link to={`/users/${userData?._id}`}>
        <img
          src={userData?.avatar || defaultAvatar}
          alt="avatar"
        />
      </Link>
      {/* Remove btn */}
      <button
        type="button"
        className={style.delete_btn}
        onClick={() => removeAction(userData?._id)}
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

// Created comments
const CreatedComments = () => {
  const user = useSelector(state => state.user);

  const commentsLimit = 10;
  const [commentsPage, setCommentsPage] = useState(1);

  const [comments, setComments] = useState([]);
  const [fetchCommentsLoad, setFetchCommentsLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setFetchCommentsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/createdComments?page=${commentsPage}&limit=${commentsLimit}`
        );
        setComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchCommentsLoad(false);
      }
    }
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  return (
    <div className={`${style.created_comments}`}>
      {/* Created comments section */}
      <>
        {
          // While fetching comments and comments length is 0
          fetchCommentsLoad && comments.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If comments have been fetched
            : comments?.length && comments.length > 0 ?
              (<div className={style.viewer}>
                {
                  comments.map((comment) => (
                    <CommentCard
                      key={comment._id}
                      comment={comment}
                      comments={comments}
                      setComments={setComments}
                    />
                  ))
                }
              </div>)

              : ""
        }
      </>

      {/* Load more comments btn section */}
      <>
        {
          // While fetching comments || If there are comments in db
          fetchCommentsLoad
            || commentsPage * commentsLimit === comments.length ?
            (<button
              type="button"
              className={style.load_more_comments_btn}
              disabled={fetchCommentsLoad ? true : false}
              style={fetchCommentsLoad ? { cursor: "revert" } : {}}
              onClick={() => {
                setFetchCommentsLoad(true)
                setCommentsPage(prev => prev + 1)
              }}
            >
              {
                fetchCommentsLoad ?
                  <PuffLoader color="#000" size={15} />
                  : "More"
              }
            </button>)

            // If comments reaches last comment
            : commentsPage * commentsLimit > comments.length ?
              (<p className={style.no_more_comments_message}>
                This section has {comments.length} comments
              </p>)

              // No thing
              : ""
        }
      </>
    </div>
  )
}

// Comment card
const CommentCard = ({ comment, comments, setComments }) => {
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // Delete comment
  const deleteComment = async (commentId, postId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate({
        method: 'delete',
        url: `posts/${postId}/comments`,
        data: { commentId: commentId }
      });
      setComments(comments.filter(comment => comment?._id !== commentId));
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.comment_card}>
      {/* Comment content */}
      <p className={style.content}>
        {comment.content}
      </p>
      {/* Comment created at */}
      <span className={style.created_at}>
        {new Date(comment?.createdAt)
          .toISOString().split('T')[0]}
      </span>
      {/* Link to the post that has the comment */}
      <Link
        className={style.comment_post_link}
        to={`/posts/${comment?.post}`}
      >
        Go to post
      </Link>
      {/* Remove comment btn */}
      <button
        type="button"
        className={style.delete_btn}
        onClick={() => {
          deleteComment(comment?._id, comment?.post)
        }}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

// Reports
const Reports = () => {
  const user = useSelector(state => state.user);

  const reportsLimit = 10;
  const [reportsPage, setReportsPage] = useState(1);

  const [reports, setReports] = useState([]);
  const [fetchReportsLoad, setFetchReportsLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setFetchReportsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/createdReports?page=${reportsPage}&limit=${reportsLimit}`
        );
        setReports((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setFetchReportsLoad(false);
      }
    }
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsPage]);

  return (
    <div className={`${style.reports}`}>
      {/* Reports section */}
      <>
        {
          // While fetching reports and reports length is 0
          fetchReportsLoad && reports.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If reports have been fetched
            : reports?.length && reports.length > 0 ?
              (<div className={style.viewer}>
                {
                  reports.map((report) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      reports={reports}
                      setReports={setReports}
                    />
                  ))
                }
              </div>)

              : ""
        }
      </>

      {/* Load more reports btn section */}
      <>
        {
          // While fetching reports || If there are reports in db
          fetchReportsLoad
            || reportsPage * reportsLimit === reports.length ?
            (<button
              type="button"
              className={style.load_more_reports_btn}
              disabled={fetchReportsLoad ? true : false}
              style={fetchReportsLoad ? { cursor: "revert" } : {}}
              onClick={() => {
                setFetchReportsLoad(true)
                setReportsPage(prev => prev + 1)
              }}
            >
              {
                fetchReportsLoad ?
                  <PuffLoader color="#000" size={15} />
                  : "More"
              }
            </button>)

            // If reports reaches last report
            : reportsPage * reportsLimit > reports.length ?
              (<p className={style.no_more_reports_message}>
                This section has {reports.length} reports
              </p>)

              // No thing
              : ""
        }
      </>
    </div>
  )
}

const ReportCard = ({ report, reports, setReports }) => {
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // Delete report
  const deleteReport = async (reportId) => {
    try {
      setRemoveLoading(true);
      const res = await axiosPrivate.delete(`reports/${reportId}`);
      setReports(reports.filter(report => report?._id !== reportId));
      notify("success", res?.data?.message);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.report_card}>
      {/* Report content */}
      <p className={style.content}>
        {report.content}
      </p>
      {/* Report created at */}
      <span className={style.created_at}>
        {new Date(report?.createdAt)
          .toISOString().split('T')[0]}
      </span>
      {/* Update report link */}
      <Link
        className={style.update_report_link}
        to={`/reports/${report?._id}/update`}
      >
        Update the report
      </Link>
      {/* Delete report btn */}
      <button
        type="button"
        className={style.delete_btn}
        onClick={() => deleteReport(report?._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          removeLoading ?
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default Settings
