/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashAlt, faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { faGauge, faGear, faUserPlus, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import style from "./ProfileControllers.module.css";
import axios from "../../../../api/axios";

const ProfileControllers = ({ userId, setOpenDeleteAccount }) => {
  const user = useSelector(state => state.user); // current user visitor

  const [followUserLoad, setFollowUserLoad] = useState(false);
  const [unfollowUserLoad, setUnFollowUserLoad] = useState(false);
  const [createChatLoad, setCreateChatLoad] = useState(false);
  const [isUserFollowed, setIsUserFollowed] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const navigate = useNavigate();

  // Check if user followed this profile page
  useEffect(() => {
    const checkIsFollowed = async () => {
      try {
        if (user?.accessToken) {
          const res = await axios.get(`/users/${user?._id}/followings/${userId}`);
          setIsUserFollowed(Boolean(res.data.data));
        }
      } catch (err) {
        handleErrors(err);
      }
    }
    checkIsFollowed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const followUser = async (newFollowedId) => {
    try {
      if (user?._id === newFollowedId) return null;
      setFollowUserLoad(true);
      const res = await axiosPrivate.post(
        `users/${user?._id}/followings/${newFollowedId}`,
      );
      setIsUserFollowed(true);
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFollowUserLoad(false)
    }
  }

  const unfollowUser = async (removedFollowingId) => {
    try {
      setUnFollowUserLoad(true);
      await axiosPrivate.delete(
        `users/${user?._id}/followings/${removedFollowingId}`
      );
      setIsUserFollowed(false);
      notify("success", "user is unfollowed");
    } catch (err) {
      handleErrors(err);
    } finally {
      setUnFollowUserLoad(false);
    }
  }

  const createChat = async (userId) => {
    try {
      setCreateChatLoad(true);
      const res = await axiosPrivate.post(
        `/chats`,
        {
          users: [userId],
          isGroupChat: false,
        }
      );
      const newChat = res.data.data;
      navigate(`/chat/${newChat._id}`);
    } catch (err) {
      handleErrors(err);
    } finally {
      setCreateChatLoad(false);
    }
  }

  return (
    <nav className={style.profile_controllers}>
      {/* Delete btn */}
      <>
        {
          (
            user?._id === userId
            || user?.roles?.includes(ROLES_LIST.Admin)
          )
            ? (<button
              type="button"
              onClick={() => setOpenDeleteAccount(true)}
              title="delete the account"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>) : ("")
        }
      </>

      {/* Follow btn */}
      <>
        {
          (user?.accessToken && user?._id !== userId && !isUserFollowed)
            ? (<button
              type="button"
              onClick={() => followUser(userId)}
              disabled={followUserLoad ? true : false}
              title="follow"
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </button>) : ("")
        }
      </>

      {/* unFollow btn */}
      <>
        {
          (user?.accessToken && user?._id !== userId && isUserFollowed)
            ? (<button
              type="button"
              onClick={() => unfollowUser(userId)}
              disabled={unfollowUserLoad ? true : false}
              title="unfollow"
            >
              <FontAwesomeIcon icon={faUserTimes} />
            </button>) : ("")
        }
      </>

      {/* Message btn */}
      <>
        {
          (user?.accessToken && user?._id !== userId)
            ? (<button
              type="button"
              onClick={() => createChat(userId)}
              disabled={createChatLoad ? true : false}
              title="send message"
            >
              <FontAwesomeIcon icon={faCommentDots} />
            </button>) : ("")
        }
      </>

      {/* Update link */}
      <>
        {
          (user?._id === userId) ?
            (<Link to={`/users/${userId}/update`}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>) : ("")
        }
      </>

      {/* Settings Link */}
      <>
        {
          (user?._id === userId) ?
            (<Link to={`/settings`}>
              <FontAwesomeIcon icon={faGear} />
            </Link>) : ("")
        }
      </>

      {/* adminDashboard Link */}
      <>
        {
          (
            user?._id === userId
            && user?.roles?.includes(ROLES_LIST.Admin)
          ) ?
            (<Link to={`/adminDashboard`}>
              <FontAwesomeIcon icon={faGauge} />
            </Link>) : ("")
        }
      </>
    </nav>
  )
}

export default ProfileControllers
