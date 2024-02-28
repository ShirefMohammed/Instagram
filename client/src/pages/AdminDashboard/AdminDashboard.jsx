import { Navigate, useLocation, useParams } from "react-router-dom";
import Header from "./components/Header/Header";
import Posts from "./components/Posts/Posts";
import Users from "./components/Users/Users";
import Reports from "./components/Reports/Reports";
import style from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const { tab } = useParams();
  const location = useLocation();

  return (
    <div className={style.admin_dashboard}>
      <Header />

      {/* Break */}
      <hr style={{
        width: "60%",
        margin: "25px auto",
        border: "1px solid #eee",
        borderBottom: "none"
      }} />

      <>
        {
          tab === undefined || tab === "posts" ?
            <Posts />

            : tab === "users" ?
              <Users />

              : tab === "reports" ?
                <Reports />

                : <Navigate
                  to="/noResourceFound"
                  state={{ from: location }}
                  replace
                />
        }
      </>
    </div>
  )
}

export default AdminDashboard
