/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./SuggestedUserCard.module.css";

const SuggestedUserCard = ({ suggestedUser, followedUsers, setFollowedUsers }) => {
  const user = useSelector(state => state.user);

  const [loading, setLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const followUser = async (newFollowedId) => {
    try {
      setLoading(true);

      const res = await axiosPrivate.post(
        `users/${user?._id}/followings/${newFollowedId}`,
      );

      setFollowedUsers([...followedUsers, newFollowedId]);

      notify("success", res.data.message);
    } catch (err) {
      handleErrors(err);
    } finally {
      setLoading(false);
    }
  }

  const unfollowUser = async (removedFollowingId) => {
    try {
      setLoading(true);

      await axiosPrivate.delete(
        `users/${user?._id}/followings/${removedFollowingId}`
      );

      setFollowedUsers(followedUsers.filter(id => id !== removedFollowingId));

      notify("success", "user is unfollowed");
    } catch (err) {
      handleErrors(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={style.user_card}>
      <img
        src={suggestedUser?.avatar || defaultAvatar}
        alt=""
      />

      <Link to={`/users/${suggestedUser?._id}`}>
        {suggestedUser?.name}
      </Link>

      <>
        {
          !followedUsers.includes(suggestedUser._id) ?
            (<button
              type="button"
              disabled={loading ? true : false}
              onClick={() => followUser(suggestedUser._id)}
            >
              {
                loading ?
                  <PuffLoader color="#000" size={17} />
                  : <span className={style.follow}>follow</span>
              }
            </button>)
            : (<button
              type="button"
              disabled={loading ? true : false}
              onClick={() => unfollowUser(suggestedUser._id)}
            >
              {
                loading ?
                  <PuffLoader color="#000" size={17} />
                  : <span className={style.unfollow}>unfollow</span>
              }
            </button>)
        }
      </>
    </div>
  )
}

export default SuggestedUserCard
