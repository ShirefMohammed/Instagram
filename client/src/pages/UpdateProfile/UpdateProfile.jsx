/* eslint-disable react/prop-types */
// Modules
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faInfoCircle, faX, faPlus } from "@fortawesome/free-solid-svg-icons";
// Hooks
import { useAxiosPrivate, useHandleErrors, useLogout, useNotify } from "../../hooks";
// Css style
import style from "./UpdateProfile.module.css";
// Images
import defaultAvatar from "../../assets/defaultAvatar.png";
// Api axios
import axios from "../../api/axios";

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

// Main Page
const UpdateProfile = () => {
  const { id } = useParams(); // general user id
  const user = useSelector(state => state.user); // current user visitor

  const [userData, setUserData] = useState({});
  const [fetchUserLoad, setFetchUserLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const location = useLocation();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchUserLoad(true);
        const res = await axios.get(`/users/${id}`);
        setUserData(res.data.data);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
        handleErrors.handleNoResourceFound(err);
      } finally {
        setFetchUserLoad(false);
      }
    }
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      {
        // While fetching user data
        fetchUserLoad ? (<div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>)

          // If visitor is the account owner
          : userData?._id === user?._id ?
            <div className={style.update_profile}>
              {/* Page Title */}
              <h2>Update My Profile</h2>

              <div className={style.update_user_info_section}>
                <UpdateUserInfo userData={userData} />
              </div>

              <div className={style.update_avatar_section}>
                <UpdateAvatar userData={userData} />
              </div>

              <div className={style.update_password_section}>
                <UpdatePassword />
              </div>

              <div className={style.delete_account_section}>
                <DeleteAccount />
              </div>
            </div>


            //If visitor does not account owner
            : userData?._id && userData?._id !== user?._id ?
              <Navigate to="/unauthorized" state={{ from: location }} replace />

              : (<div className={style.error_container}>
                Some errors happen when fetching user
              </div>)
      }
    </>
  )
}

// Update User Info section (name, email, bio, links)
const UpdateUserInfo = ({ userData }) => {
  const { id } = useParams();

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  const [name, setName] = useState(userData?.name || "");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email] = useState(userData?.email || "");

  const [bio, setBio] = useState(userData?.bio || "");
  const [validBio, setValidBio] = useState(false);
  const [BioFocus, setBioFocus] = useState(false);

  const [links, setLinks] = useState(userData?.links || []);
  const [newLink, setNewLink] = useState("");
  const [isLinksChanged, setIsLinksChanged] = useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);

  // Reset error message
  useEffect(() => {
    setErrMsg("");
  }, [name, bio]);

  // Track valid name
  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  // Track valid bio
  useEffect(() => {
    setValidBio(bio.length <= 250);
  }, [bio]);

  // Track if links changed
  useEffect(() => {
    setIsLinksChanged(!arraysEqual(links, userData?.links));
  }, [links, userData?.links]);

  // Check if new link added
  const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  // Add link to links
  const addLinkToLinks = async () => {
    if (links.length === 3) {
      return notify("info", "Maximum number of links is 3")
    }

    if (links.includes(newLink)) {
      return notify("info", "Link have been already added")
    }

    setLinks([...links, newLink]);
    setNewLink("");
  }

  // Remove link from links
  const removeFromLinks = async (link) => {
    setLinks(links.filter(l => l !== link));
  }

  // Update User Info
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!NAME_REGEX.test(name)) {
        await setErrMsg("Invalid Name");
        errRef.current.focus();
        return null;
      }

      if (bio.length > 250) {
        await setErrMsg("Bio must be at most 250 characters");
        errRef.current.focus();
        return null;
      }

      if (links.length > 3) {
        await setErrMsg("Max number of links is 3");
        errRef.current.focus();
        return null;
      }

      setUpdateLoading(true);

      const res = await axiosPrivate.patch(
        `users/${id}`,
        { name: name, bio: bio, links: links }
      );

      setName(res?.data?.data?.name);
      setBio(res?.data?.data?.bio);
      setLinks(res?.data?.data?.links);

      notify("success", res?.data?.message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Update Failed');
      errRef.current.focus();
    }

    finally {
      setUpdateLoading(false);
    }
  }

  return (
    <form
      className={style.update_user_info}
      onSubmit={handleSubmit}
    >
      {/* Section Title */}
      <h3>Main Information</h3>

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

      {/* Name */}
      <div>
        <label htmlFor="name">
          Name:
        </label>
        <span className={style.check_mark}>
          {
            name === "" ? ("")
              : validName ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="text"
          id="name"
          autoComplete="off"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
          aria-invalid={!validName ? "true" : "false"}
          aria-describedby="nameNote"
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
        />
        {
          nameFocus && name && !validName ?
            <p id="nameNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Name must be 4 to 24 characters.<br />
              Must begin with a letter.<br />
              Letters, numbers, underscores, hyphens allowed.<br />
              No spaces.
            </p>
            : ""
        }
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">
          Email:
        </label>
        <input
          type="email"
          id="email"
          autoComplete="off"
          placeholder="Email"
          value={email}
          readOnly={true}
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio">
          Bio:
        </label>
        <span className={style.check_mark}>
          {
            validBio ?
              (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
              : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <textarea
          autoComplete="off"
          id="bio"
          placeholder="Bio"
          onChange={(e) => setBio(e.target.value)}
          value={bio}
          aria-invalid={!validBio ? "true" : "false"}
          aria-describedby="emailNote"
          onFocus={() => setBioFocus(true)}
          onBlur={() => setBioFocus(false)}
        ></textarea>
        {
          BioFocus && !validBio ?
            <p id="bioNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Bio must be at most 250 characters
            </p>
            : ""
        }
      </div>

      {/* Links */}
      <div className={style.links_container}>
        <label htmlFor="links">
          Links:
        </label>
        <div className={style.links}>
          {
            links.length > 0 ? links.map((link) => (
              <div key={link} className={style.link}>
                <Link to={link} target="_blank">
                  {link}
                </Link>
                <button
                  type="button"
                  onClick={() => removeFromLinks(link)}
                >
                  <FontAwesomeIcon icon={faX} />
                </button>
              </div>
            ))
              : links.length === 0 ?
                (<p className={style.no_links_added}>
                  No links added
                </p>)
                : ""
          }
        </div>
        <div className={style.add_link}>
          <input
            type="text"
            id="links"
            autoComplete="off"
            placeholder="Add new link"
            onChange={(e) => setNewLink(e.target.value)}
            value={newLink}
          />
          <button
            type="button"
            onClick={addLinkToLinks}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={
          updateLoading ||
            (
              name === userData?.name
              && bio === userData?.bio
              && !isLinksChanged
            )
            ? true
            : false
        }
        style={
          updateLoading ||
            (
              name === userData?.name
              && bio === userData?.bio
              && !isLinksChanged
            )
            ? { opacity: .5, cursor: "revert" }
            : {}
        }
      >
        <span>Save Updates</span>
        {updateLoading && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  )
}

// Update Avatar section
const UpdateAvatar = ({ userData }) => {
  const { id } = useParams();

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  const [avatar, setAvatar] = useState(userData?.avatar);

  const [updateLoading, setUpdateLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // Reset error message
  useEffect(() => {
    setErrMsg("");
  }, [avatar]);

  // Change User Avatar
  const ChangeAvatar = async (newAvatar) => {
    try {
      if (!newAvatar) return null;

      setUpdateLoading(true);

      const formData = new FormData();
      formData.append("avatar", newAvatar);

      const res = await axiosPrivate.patch(
        `users/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      setAvatar(res?.data?.data?.avatar)
      notify("success", "Avatar changed successfully");
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Update Failed');
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

// Update Password section
const UpdatePassword = () => {
  const { id } = useParams();

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  const [oldPassword, setOldPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [validNewPassword, setValidNewPassword] = useState(false);
  const [newPasswordFocus, setNewPasswordFocus] = useState(false);

  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [validConfirmNewPassword, setValidConfirmNewPassword] = useState(false);
  const [confirmNewPasswordFocus, setConfirmNewPasswordFocus] = useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // Reset error message
  useEffect(() => {
    setErrMsg("");
  }, [oldPassword, newPassword]);

  // Track valid passwords
  useEffect(() => {
    setValidNewPassword(PASS_REGEX.test(newPassword));
    setValidConfirmNewPassword(confirmNewPassword === newPassword);
  }, [newPassword, confirmNewPassword]);

  // Change Password
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        await setErrMsg("All fields are required");
        errRef.current.focus();
        return null;
      }

      if (!PASS_REGEX.test(newPassword)) {
        await setErrMsg("Invalid Password");
        errRef.current.focus();
        return null;
      }

      setUpdateLoading(true);

      const res = await axiosPrivate.patch(
        `users/${id}`,
        { oldPassword: oldPassword, newPassword: newPassword }
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      notify("success", res?.data?.message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Update Failed');
      errRef.current.focus();
    }

    finally {
      setUpdateLoading(false);
    }
  }

  return (
    <form
      className={style.update_password}
      onSubmit={handleSubmit}
    >
      {/* Section Title */}
      <h3>Change Password</h3>

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

      {/* Old Password */}
      <div>
        <label htmlFor="oldPassword">
          Old Password:
        </label>
        <input
          type="password"
          id="oldPassword"
          placeholder="Old Password"
          onChange={(e) => setOldPassword(e.target.value)}
          value={oldPassword}
        />
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword">
          New Password:
        </label>
        <span className={style.check_mark}>
          {
            newPassword === "" ? ("")
              : validNewPassword ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="password"
          id="newPassword"
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          required
          aria-invalid={validNewPassword ? "false" : "true"}
          aria-describedby="newPasswordNote"
          onFocus={() => setNewPasswordFocus(true)}
          onBlur={() => setNewPasswordFocus(false)}
        />
        {
          newPasswordFocus && !validNewPassword ?
            <p id="newPasswordNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              8 to 24 characters.<br />
              Must include uppercase and lowercase letters
              , a number and a special character.<br />
              Allowed special characters:
              <span aria-label="exclamation mark"> ! </span>
              <span aria-label="at symbol">@ </span>
              <span aria-label="hashtag"># </span>
              <span aria-label="dollar sign">$ </span>
              <span aria-label="percent">% </span>
            </p>
            : ""
        }
      </div>

      {/* Confirm New Password */}
      <div>
        <label htmlFor="confirmNewPassword">
          Confirm New Password:
        </label>
        <span className={style.check_mark}>
          {
            confirmNewPassword === "" ? ("")
              : validConfirmNewPassword ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="password"
          id="confirmNewPassword"
          placeholder="Confirm New Password"
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          value={confirmNewPassword}
          required
          aria-invalid={validConfirmNewPassword ? "false" : "true"}
          aria-describedby="confirmNote"
          onFocus={() => setConfirmNewPasswordFocus(true)}
          onBlur={() => setConfirmNewPasswordFocus(false)}
        />
        {
          confirmNewPasswordFocus
            && confirmNewPassword
            && !validConfirmNewPassword ?
            <p id="confirmNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match password field.
            </p>
            : ""
        }
      </div>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={
          updateLoading ||
            (
              !oldPassword
              || !validNewPassword
              || !validConfirmNewPassword
            )
            ? true
            : false
        }
        style={
          updateLoading ||
            (
              !oldPassword
              || !validNewPassword
              || !validConfirmNewPassword
            )
            ? { opacity: .5, cursor: "revert" }
            : {}
        }
      >
        <span>Change Password</span>
        {updateLoading && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  )
}

// Delete Account section
const DeleteAccount = () => {
  const { id } = useParams();

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  const [password, setPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const logout = useLogout();
  const notify = useNotify();

  // Reset error message
  useEffect(() => {
    setErrMsg("");
  }, [password]);

  // Delete account
  const deleteAccount = async (e) => {
    e.preventDefault();

    try {
      if (!password) {
        await setErrMsg("Password is required");
        errRef.current.focus();
        return null;
      }

      setDeleteLoading(true);

      const res = await axiosPrivate({
        method: 'delete',
        url: `users/${id}`,
        data: { password: password }
      });

      logout();
      notify("success", res?.data?.message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Delete Account Failed');
      errRef.current.focus();
    }

    finally {
      setDeleteLoading(false);
    }
  }

  return (
    <form
      className={style.delete_account}
      onSubmit={deleteAccount}
    >
      {/* Section Title */}
      <h3>Delete Account</h3>

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

      {/* Password */}
      <div>
        <label htmlFor="Password">
          Password:
        </label>
        <input
          type="password"
          id="Password"
          placeholder="Enter password to delete account"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={deleteLoading || !password ? true : false}
        style={
          deleteLoading || !password
            ? { opacity: .5, cursor: "revert" }
            : {}
        }
      >
        <span>Delete Account</span>
        {deleteLoading && <MoonLoader color="#fff" size={15} />}
      </button>
    </form>
  )
}

export default UpdateProfile
