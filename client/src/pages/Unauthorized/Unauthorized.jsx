import { useNavigate } from "react-router-dom";
import style from "./Unauthorized.module.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <section className={style.unauthorized}>
      <div>
        <h2>Unauthorized</h2>

        <p>You do not have access to the this page.</p>

        <div className={style.buttons}>
          <button onClick={goBack}>Go Back</button>
          <button onClick={goHome}>Go Home</button>
        </div>
      </div>
    </section>
  )
}

export default Unauthorized
