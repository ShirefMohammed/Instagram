import { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MoonLoader } from 'react-spinners';
import { useNotify } from "../../hooks";
import { setUser } from "../../store/slices/userSlice";
import style from "./Login.module.css";
import axios from "../../api/axios";

const LOGIN_URL = `/auth/login`;

const Login = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const emailRef = useRef(null);
  const errRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    setTimeout(() => {
      emailRef.current.focus();
    }, 1);
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [email, password]);

  const togglePersist = () => {
    dispatch(setUser({ ...user, persist: !user?.persist }));
  }

  useEffect(() => {
    localStorage.setItem("persist", user?.persist);
  }, [user?.persist]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        LOGIN_URL,
        {
          email: email,
          password: password
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      const message = response?.data?.message;
      const data = response?.data?.data;
      dispatch(setUser({ ...user, ...data }));
      notify("success", message);

      setEmail('');
      setPassword('');
      navigate(from, { replace: true });
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Login Failed');
      errRef.current.focus();
    }

    finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={style.login_form}
      onSubmit={handleSubmit}
    >
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

      <h2>Login</h2>

      <input
        type="email"
        ref={emailRef}
        autoComplete="off"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        required
      />

      <div className={style.persistCheck}>
        <input
          type="checkbox"
          id="persist1"
          onChange={togglePersist}
          checked={user?.persist}
        />
        <label htmlFor="persist1">Remember Me</label>
      </div>

      <button
        type='submit'
        disabled={loading ? true : false}
      >
        <span>Login</span>
        {loading && <MoonLoader color="#fff" size={15} />}
      </button>
    </form>
  )
}

export default Login
