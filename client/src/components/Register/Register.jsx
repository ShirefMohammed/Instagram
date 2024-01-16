// Modules
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MoonLoader } from "react-spinners";
import {
  faCheck,
  faTimes,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Hooks
import { useNotify } from "../../hooks";
// Store
import { setUser } from "../../store/slices/userSlice";
// Default avatar image
import defaultAvatar from "../../assets/defaultAvatar.png";
// Css style
import style from "./Register.module.css";
// Api axios
import axios from "../../api/axios";

const REGISTER_URL = "/auth/register";

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const nameRef = useRef();
  const errRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [name, setName] = useState('');
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [EmailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [validConfirmPassword, setValidConfirmPassword] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const [avatar, setAvatar] = useState();
  const [avatarHover, setAvatarHover] = useState(false);

  // Focus on name input
  useEffect(() => {
    setTimeout(() => {
      nameRef.current.focus();
    }, 0);
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [name, email, password, confirmPassword, avatar]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(PASS_REGEX.test(password));
    setValidConfirmPassword(confirmPassword === password);
  }, [password, confirmPassword]);

  const togglePersist = () => {
    dispatch(setUser({ ...user, persist: !user?.persist }));
  }

  useEffect(() => {
    localStorage.setItem("persist", user?.persist);
  }, [user?.persist]);

  // Register
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // if button enabled with JS hack
      if (
        !NAME_REGEX.test(name)
        || !EMAIL_REGEX.test(email)
        || !PASS_REGEX.test(password)
      ) {
        setErrMsg("Invalid Entry");
        errRef.current.focus();
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar", avatar);

      const response = await axios.post(
        REGISTER_URL,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      const message = response?.data?.message;
      const data = response?.data?.data;
      dispatch(setUser({ ...user, ...data }));
      notify("success", message);

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      navigate(from, { replace: true });
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Register Failed');
      errRef.current.focus();
    }

    finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={style.register_form}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      {/* Error Message */}
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

      {/* Form Title */}
      <h2>Register</h2>

      {/* Name */}
      <div>
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
          ref={nameRef}
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
              4 to 24 characters.<br />
              Must begin with a letter.<br />
              Letters, numbers, underscores, hyphens allowed.<br />
              No spaces.
            </p>
            : ""
        }
      </div>

      {/* Email */}
      <div>
        <span className={style.check_mark}>
          {
            email === "" ? ("")
              : validEmail ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="email"
          autoComplete="off"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          aria-invalid={!validEmail ? "true" : "false"}
          aria-describedby="emailNote"
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
        />
        {
          EmailFocus && email && !validEmail ?
            <p id="emailNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Enter valid email.
            </p>
            : ""
        }
      </div>

      {/* Password */}
      <div>
        <span className={style.check_mark}>
          {
            password === "" ? ("")
              : validPassword ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          aria-invalid={validPassword ? "false" : "true"}
          aria-describedby="passwordNote"
          onFocus={() => setPasswordFocus(true)}
          onBlur={() => setPasswordFocus(false)}
        />
        {
          passwordFocus && !validPassword ?
            <p id="passwordNote" className={style.instructions}>
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

      {/* Confirm Password */}
      <div>
        <span className={style.check_mark}>
          {
            confirmPassword === "" ? ("")
              : validConfirmPassword ?
                (<FontAwesomeIcon icon={faCheck} className={style.valid} />)
                : (<FontAwesomeIcon icon={faTimes} className={style.invalid} />)
          }
        </span>
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          required
          aria-invalid={validConfirmPassword ? "false" : "true"}
          aria-describedby="confirmNote"
          onFocus={() => setConfirmPasswordFocus(true)}
          onBlur={() => setConfirmPasswordFocus(false)}
        />
        {
          confirmPasswordFocus && !validConfirmPassword ?
            <p id="confirmNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match password field.
            </p>
            : ""
        }
      </div>

      {/* Upload Avatar */}
      <div className={style.avatar}>
        {
          avatar ?
            (<img src={URL.createObjectURL(avatar)} alt="avatar" />)
            : (<img src={defaultAvatar} alt="avatar" />)
        }
        <input
          type="file"
          accept=".jpeg, .jpg, .png, .jfif"
          multiple={false}
          aria-describedby="avatarFileNote"
          onChange={(e) => setAvatar(e.target.files[0])}
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
        />
        {
          avatarHover ?
            <p id="avatarFileNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Optional.
            </p>
            : ""
        }
      </div>

      {/* Persist Check Box */}
      <div className={style.persistCheck}>
        <input
          type="checkbox"
          id="persist2"
          onChange={togglePersist}
          checked={user?.persist}
        />
        <label htmlFor="persist2">Remember Me</label>
      </div>

      {/* Submit Btn */}
      <button
        type="submit"
        disabled={loading ? true : false}
        style={loading ? { opacity: .5, cursor: "revert" } : {}}
      >
        <span>Register</span>
        {loading && <MoonLoader color="#fff" size={15} />}
      </button>
    </form>
  )
}

export default Register
