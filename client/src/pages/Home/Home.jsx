/* eslint-disable react/prop-types */
// Modules
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { jwtDecode } from "jwt-decode";
// Components
import {
  SuggestedPosts
} from "../../components";
// Hooks
import {
  useAxiosPrivate,
  useNotify
} from "../../hooks";
// Default avatar image
import defaultAvatar from "../../assets/defaultAvatar.png";
// Css style
import style from "./Home.module.css";

// Main Component - Home
const Home = () => {
  const user = useSelector(state => state.user);

  return (
    <div className={style.home}>
      {/* Right side - Followings && Suggested Posts */}
      <div className={style.right_side}>
        <Followings />
        <SuggestedPosts />
      </div>

      {/* Left side - Suggested Users to follow */}
      {
        user?.accessToken ?
          <div className={style.left_side}>
            <SuggestedUsers />
          </div>
          : ""
      }
    </div>
  )
}

// Followings Component to show some User Followings
const Followings = () => {
  const user = useSelector(state => state.user);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  // Decode accessToken to get user id
  const decoded = user?.accessToken ? jwtDecode(user?.accessToken) : undefined;

  // Fetch Suggested Users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        if (!user?.accessToken) return null;
        setLoading(true);
        const res = await axiosPrivate.get(
          `/users/${decoded?.userInfo?.userId}/followings`
        );
        setFollowings(res?.data?.data || []);
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.followings}>
      {
        // While fetching user followings
        loading ?
          <div className={style.loading_container}>
            <PuffLoader color="#000" size={25} />
          </div>

          // If user login and have followings
          : followings?.length && followings.length > 0 ?
            <ul>
              {
                followings.map((following) => {
                  if (following?._id) {
                    return <li key={following._id}>
                      <Link to={`users/${following._id}`}>
                        <img
                          src={following?.avatar || defaultAvatar}
                          alt="avatar"
                        />
                      </Link>
                    </li>
                  }
                })
              }
            </ul>

            // No thing
            : ""
      }
    </div>
  )
}

// Suggested Users List to follow if it is wanted
const SuggestedUsers = () => {
  const user = useSelector(state => state.user);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  // Fetch Suggested Users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        if (!user?.accessToken) return null;
        const res = await axiosPrivate.get("/users/suggest");
        setSuggestedUsers(res?.data?.data || []);
      } catch (err) {
        console.log(err)
      }
    }
    fetchSuggestedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.suggested_users}>
      <h2>
        Suggested for you
      </h2>
      <ul>
        {
          suggestedUsers.map((suggestedUser) => {
            if (suggestedUser?._id) {
              return <li key={suggestedUser._id}>
                <SuggestedUserCard suggestedUser={suggestedUser} />
              </li>
            }
          })
        }
      </ul>
    </div>
  )
}

// Suggested User Card
const SuggestedUserCard = ({ suggestedUser }) => {
  const user = useSelector(state => state.user);

  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useNotify();

  // Decode accessToken to get user id
  const decoded = user?.accessToken ? jwtDecode(user?.accessToken) : undefined;

  // Follow user
  const followUser = async (newFollowedId) => {
    try {
      setLoading(true);
      const res = await axiosPrivate.post(
        `users/${decoded?.userInfo?.userId}/followings`,
        { newFollowedId: newFollowedId }
      );
      setFollowedUsers([...followedUsers, newFollowedId]);
      notify("success", res?.data?.message);
    } catch (err) {
      if (err?.response?.status === 403) {
        navigate(
          "/authentication",
          { state: { from: location }, replace: true }
        )
      }
    } finally {
      setLoading(false);
    }
  }

  // Unfollow user
  const unfollowUser = async (removedFollowingId) => {
    try {
      setLoading(true);
      const res = await axiosPrivate({
        method: 'delete',
        url: `users/${decoded?.userInfo?.userId}/followings`,
        data: { removedFollowingId: removedFollowingId }
      });
      setFollowedUsers(followedUsers.filter(id => id !== removedFollowingId));
      notify("success", res?.data?.message);
    } catch (err) {
      if (err?.response?.status === 403) {
        navigate(
          "/authentication",
          { state: { from: location }, replace: true }
        )
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={style.user_card}>
      {/* avatar */}
      <img
        src={suggestedUser?.avatar || defaultAvatar}
        alt="avatar"
      />

      {/* name link to profile */}
      <Link to={`/users/${suggestedUser?._id}`}>
        {suggestedUser?.name}
      </Link>

      {/* follow && unfollow buttons */}
      {
        !followedUsers.includes(suggestedUser._id) ?
          <button
            type="button"
            onClick={() => followUser(suggestedUser._id)}
          >
            {
              loading ?
                <PuffLoader color="#000" size={17} />
                : <span className={style.follow}>follow</span>
            }
          </button>
          : <button
            type="button"
            onClick={() => unfollowUser(suggestedUser._id)}
          >
            {
              loading ?
                <PuffLoader color="#000" size={17} />
                : <span className={style.unfollow}>unfollow</span>
            }
          </button>
      }
    </div>
  )
}

export default Home
