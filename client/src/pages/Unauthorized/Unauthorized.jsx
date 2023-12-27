import { useNavigate } from "react-router-dom";
import style from "./Unauthorized.module.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <section className={style.unauthorized}>
      <div>
        <h2>Unauthorized</h2>
        <p>You do not have access to the this page.</p>
        <button onClick={goBack}>Go Back</button>
      </div>
    </section>
  )
}

export default Unauthorized
