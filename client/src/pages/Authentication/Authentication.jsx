// Modules
import { useState } from "react";
// Components
import { Login, Register } from "../../components";
// Css style
import style from "./Authentication.module.css";

const Authentication = () => {
  const [authType, setAuthType] = useState("login");

  return (
    <section className={style.authentication_page}>
      <div className={`${style.container}
        ${authType === "register" ? style.active : ""}`}
      >
        {/* Login */}
        <div className={`${style.form_container} ${style.login}`}>
          <Login />
        </div>

        {/* Register */}
        <div className={`${style.form_container} ${style.register}`}>
          <Register />
        </div>

        {/* Toggle UI */}
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
                onClick={() => setAuthType("login")}
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
                onClick={() => setAuthType("register")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Toggle btn in small screen */}
        <button
          className={style.toggle_btn}
          type="button"
          onClick={() => {
            if (authType === "login")
              setAuthType("register");
            else if (authType === "register")
              setAuthType("login");
          }}
        >
          {
            authType === "login" ?
              (<span>Sign Up</span>)
              : (<span>Sign In</span>)
          }
        </button>
      </div>
    </section>
  )
}

export default Authentication
