import { useNavigate } from "react-router-dom";
import style from "./NoResourceFound.module.css";

const NoResourceFound = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <section className={style.no_resource_found}>
      <div>
        <h2>No Resource Found</h2>

        <p>The resource you look for is not found</p>

        <div className={style.buttons}>
          <button onClick={goBack}>Go Back</button>
          <button onClick={goHome}>Go Home</button>
        </div>
      </div>
    </section>
  )
}

export default NoResourceFound
