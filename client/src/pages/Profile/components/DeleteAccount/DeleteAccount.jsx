/* eslint-disable react/prop-types */
import { useEffect, useRef, useState, } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useLogout, useNotify } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import style from "./DeleteAccount.module.css";

const DeleteAccount = ({ setOpenDeleteAccount }) => {
  const userId = useParams().id; // general user id
  const user = useSelector(state => state.user); // current user visitor

  const errRef = useRef(null);

  const [password, setPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const logout = useLogout();
  const notify = useNotify();

  const navigate = useNavigate();

  useEffect(() => setErrMsg(""), [password]);

  const deleteAccount = async (e) => {
    e.preventDefault();

    try {
      setDeleteLoading(true);

      await axiosPrivate({
        method: 'delete',
        url: `users/${userId}`,
        data: { password: password }
      });

      if (user.roles.includes(ROLES_LIST.Admin)) {
        navigate("/");
        notify("success", "user account is deleted");
      } else {
        logout();
        notify("success", "account is deleted");
      }
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
    <div className={style.delete_account}>
      <form onSubmit={deleteAccount}>
        <h3>Delete Account</h3>

        <button
          type="button"
          className={style.close_btn}
          onClick={() => setOpenDeleteAccount(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

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

        <>
          {
            (user?.roles && !user.roles.includes(ROLES_LIST.Admin)) ?
              (<div>
                <label htmlFor="Password">
                  Password:
                </label>
                <input
                  type="password"
                  id="Password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>)
              : ("")
          }
        </>

        <button
          type='submit'
          disabled={deleteLoading ? true : false}
          style={deleteLoading ? { opacity: .5, cursor: "revert" } : {}}
        >
          <span>Delete the Account</span>
          {deleteLoading && <MoonLoader color="#fff" size={10} />}
        </button>
      </form>
    </div>
  )
}

export default DeleteAccount
