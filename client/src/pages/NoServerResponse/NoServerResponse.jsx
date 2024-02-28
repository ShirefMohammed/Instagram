import { useNavigate } from "react-router-dom";
import style from "./NoServerResponse.module.css";

const NoServerResponse = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <section className={style.no_server_response}>
      <div>
        <h2>No Server Response</h2>

        <p>There is no server response, try after while</p>

        <div className={style.buttons}>
          <button onClick={goBack}>Go Back</button>
          <button onClick={goHome}>Go Home</button>
        </div>
      </div>
    </section>
  )
}

export default NoServerResponse
