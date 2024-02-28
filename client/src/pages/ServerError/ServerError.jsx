import { useNavigate } from "react-router-dom";
import style from "./ServerError.module.css";

const ServerError = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <section className={style.server_error}>
      <div>
        <h2>Server Error</h2>

        <p>Some errors happened in server, try again after while</p>

        <div className={style.buttons}>
          <button onClick={goBack}>Go Back</button>
          <button onClick={goHome}>Go Home</button>
        </div>
      </div>
    </section>
  )
}

export default ServerError
