import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogout } from "../../hooks";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import style from "./Authentication.module.css";

const Authentication = () => {
  const user = useSelector(state => state.user);

  const [page, setPage] = useState("login");

  const navigate = useNavigate();
  const logout = useLogout();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <>
      {
        !user?.accessToken ?

          (<section className={style.authentication_page} >
            <div className={`${style.container} ${page === "register" ? style.active : ""}`}>
              <div className={`${style.form_container} ${style.login}`}>
                <Login />
              </div>

              <div className={`${style.form_container} ${style.register}`}>
                <Register />
              </div>

              <div className={style.toggle_container}>
                <div className={style.toggle}>
                  <div className={`${style.toggle_panel} ${style.toggle_left}`}>
                    <h2>
                      Welcome Back!
                    </h2>
                    <p>
                      Enter your personal details to use all of site features
                    </p>
                    <button
                      className={style.hidden}
                      onClick={() => setPage("login")}
                    >
                      Sign In
                    </button>
                  </div>

                  <div className={`${style.toggle_panel} ${style.toggle_right}`}>
                    <h2>
                      Hello, Friend!
                    </h2>
                    <p>
                      Register with your personal details to use all of site features
                    </p>
                    <button
                      className={style.hidden}
                      onClick={() => setPage("register")}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>

              <button
                className={style.toggle_btn}
                type="button"
                onClick={() => {
                  page === "login" ? setPage("register") : setPage("login");
                }}
              >
                {page === "login" ? (<span>Sign Up</span>) : (<span>Sign In</span>)}
              </button>
            </div>
          </section >)

          : (<section className={style.not_available_page}>
            <div>
              <h2>Not available page</h2>

              <p>You have already authenticated, you can logout to reauthenticate.</p>

              <div className={style.buttons}>
                <button onClick={goBack}>Go Back</button>
                <button onClick={goHome}>Go Home</button>
                <button onClick={logout}>Log Out</button>
              </div>
            </div>
          </section>)
      }
    </>
  )
}

export default Authentication
