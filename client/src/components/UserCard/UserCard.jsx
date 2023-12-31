/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import style from "./UserCard.module.css";
import defaultAvatar from "../../assets/defaultAvatar.png";

const UserCard = ({ user }) => {
  return (
    <div className={style.user_card}>
      <img src={user?.avatar || defaultAvatar} alt="avatar" />
      <Link to={`/users/${user?._id}`}>{user?.name}</Link>
    </div>
  )
}

export default UserCard
