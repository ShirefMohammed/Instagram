/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import style from "./UserCard.module.css";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import ROLES_LIST from "../../../../utils/roles_list";

const UserCard = ({ userData, users, setUsers }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const deleteUser = async () => {
    try {
      setDeleteLoading(true);
      const res = await axiosPrivate.delete(`users/${userData?._id}`);
      setUsers(users.filter(item => item._id !== userData?._id));
      notify("success", res.data.message);
    } catch (err) {
      handleErrors(
        err,
        [
          "handleNoServerResponse",
          "handleServerError",
          "handleUnauthorized",
          "handleExpiredRefreshToken",
          "handleNoResourceFound"
        ]
      );
    } finally {
      setDeleteLoading(false);
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

      <p>
        Roles:
        {
          userData?.roles?.includes(ROLES_LIST.User) &&
          <span>user</span>
        }
        {
          userData?.roles?.includes(ROLES_LIST.Editor) &&
          <span>, editor</span>
        }
        {
          userData?.roles?.includes(ROLES_LIST.Admin) &&
          <span>, admin</span>
        }
      </p>

      <button
        type="button"
        className={style.delete_btn}
        onClick={() => deleteUser(userData?._id)}
        disabled={deleteLoading ? true : false}
        style={deleteLoading ? { opacity: .5, cursor: "revert" } : {}}
      >
        {
          deleteLoading ?
            <PuffLoader color="#fff" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default UserCard
