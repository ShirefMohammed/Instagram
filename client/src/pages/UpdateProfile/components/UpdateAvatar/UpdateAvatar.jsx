/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { setUser } from "../../../../store/slices/userSlice";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./UpdateAvatar.module.css";

const UpdateAvatar = ({ userData }) => {
  const userId = useParams().id;

  const user = useSelector(state => state.user);

  const errRef = useRef(null);

  const [errMsg, setErrMsg] = useState("");

  const [avatar, setAvatar] = useState(userData?.avatar);

  const [updateLoading, setUpdateLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const dispatch = useDispatch();

  useEffect(() => setErrMsg(""), [avatar]);

  const ChangeAvatar = async (newAvatar) => {
    try {
      if (!newAvatar) return null;

      setUpdateLoading(true);

      const formData = new FormData();
      formData.append("avatar", newAvatar);

      const res = await axiosPrivate.patch(
        `users/${userId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      setAvatar(res.data.data.avatar);
      dispatch(setUser({ ...user, avatar: res.data.data.avatar }));

      notify("success", "Avatar is changed");
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Update is Failed');
      errRef.current.focus();
    }

    finally {
      setUpdateLoading(false);
    }
  }

  return (
    <form
      className={style.update_avatar}
      encType="multipart/form-data"
    >
      {/* Section Title */}
      <h3>Change avatar</h3>

      {/* Error Message */}
      <>
        {
          errMsg &&
          <p
            ref={errRef}
            className={style.error_message}
            aria-live="assertive"
          >
            {errMsg}
          </p>
        }
      </>

      {/* Avatar */}
      <div className={style.avatar}>
        <img src={avatar || defaultAvatar} alt="avatar" />
        <input
          type="file"
          accept=".jpeg, .jpg, .png, .jfif"
          multiple={false}
          onChange={(e) => ChangeAvatar(e.target.files[0])}
        />
        {updateLoading && <MoonLoader color="#000" size={15} />}
      </div>
    </form>
  )
}

export default UpdateAvatar
