import { useSelector } from "react-redux";
import Followings from "./components/Followings/Followings";
import SuggestedPosts from "./components/SuggestedPosts/SuggestedPosts";
import SuggestedUsers from "./components/SuggestedUsers/SuggestedUsers";
import style from "./Home.module.css";

const Home = () => {
  const user = useSelector(state => state.user);

  return (
    <div className={style.home}>
      <div className={style.left_side}>
        {user?.accessToken ? <Followings /> : ("")}
        <SuggestedPosts />
      </div>

      <>
        {
          user?.accessToken ?
            (<div className={style.right_side}>
              <SuggestedUsers />
            </div>)
            : ("")
        }
      </>
    </div>
  )
}

export default Home
