/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useLogout, useNotify } from "../../../../hooks";
import style from "./DeleteAccount.module.css";

const DeleteAccount = () => {
  const userId = useParams().id;

  const errRef = useRef(null);

  const [password, setPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const logout = useLogout();
  const notify = useNotify();

  useEffect(() => setErrMsg(""), [password]);

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
        url: `users/${userId}`,
        data: { password: password }
      });

      logout();
      notify("success", res.data.message);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Account is not deleted');
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

export default DeleteAccount
