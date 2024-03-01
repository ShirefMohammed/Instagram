import { Navigate, useLocation, useParams } from "react-router-dom";
import Controllers from "./components/Controllers/Controllers";
import CreatedPosts from "./components/CreatedPosts/CreatedPosts";
import SavedPosts from "./components/SavedPosts/SavedPosts";
import LikedPosts from "./components/LikedPosts/LikedPosts";
import Followings from "./components/Followings/Followings";
import Followers from "./components/Followers/Followers";
import CreatedComments from "./components/CreatedComments/CreatedComments";
import Reports from "./components/Reports/Reports";
import style from "./Settings.module.css";

const Settings = () => {
  const { tab } = useParams();

  const location = useLocation();

  return (
    <div className={style.settings}>
      <h2>My Settings</h2>

      <div className={style.header}>
        <Controllers />
      </div>

      <hr style={{
        width: "60%",
        margin: "25px auto",
        border: "1px solid #eee",
        borderBottom: "none"
      }} />

      <div className={style.current_section}>
        {
          tab === undefined || tab === "createdPosts" ?
            <CreatedPosts />

            : tab === "savedPosts" ?
              <SavedPosts />

              : tab === "likedPosts" ?
                <LikedPosts />

                : tab === "followings" ?
                  <Followings />

                  : tab === "followers" ?
                    <Followers />

                    : tab === "createdComments" ?
                      <CreatedComments />

                      : tab === "reports" ?
                        <Reports />

                        : <Navigate
                          to="/noResourceFound"
                          state={{ from: location }}
                          replace
                        />
        }
      </div>
    </div>
  )
}

export default Settings
