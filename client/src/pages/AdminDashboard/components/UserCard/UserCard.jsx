/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./UserCard.module.css";

const UserCard = ({ userData, users, setUsers }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const deleteUser = async (userId) => {
    try {
      setDeleteLoading(true);
      await axiosPrivate.delete(`users/${userId}`);
      setUsers(users.filter(item => item._id !== userId));
      notify("success", "user account is deleted");
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className={style.user_card}>
      <img
        src={userData?.avatar || defaultAvatar}
        alt=""
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
            <PuffLoader color="#000" size={20} />
            : <FontAwesomeIcon icon={faTrashCan} />
        }
      </button>
    </div>
  )
}

export default UserCard