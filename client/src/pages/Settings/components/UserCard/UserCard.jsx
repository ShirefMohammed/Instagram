/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./UserCard.module.css";

const UserCard = ({ userData, users, setUsers, removeUserType }) => {
  const user = useSelector(state => state.user);

  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const remove = async (userId) => {
    if (removeUserType === "unfollow") {
      await unfollow(userId);
    } else if (removeUserType === "removeFollower") {
      await removeFollower(userId);
    }
  }

  const unfollow = async (userId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(
        `users/${user?._id}/followings/${userId}/`
      );
      setUsers(users.filter(item => item._id !== userId));
      notify("success", "user is unfollowed");
    } catch (err) {
      handleErrors(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  const removeFollower = async (userId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(
        `users/${user?._id}/followers/${userId}/`
      );
      setUsers(users.filter(item => item._id !== userId));
      notify("success", "user is removed from followers");
    } catch (err) {
      handleErrors(err);
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div className={style.user_card}>
      <img
        src={userData?.avatar || defaultAvatar}
        alt="avatar"
        loading="lazy"
      />

      <Link to={`/users/${userData?._id}`}>
        {userData?.name}
      </Link>

      <p>{userData?.email}</p>

      <button
        type="button"
        className={style.remove_btn}
        onClick={() => remove(userData?._id)}
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

export default UserCard
