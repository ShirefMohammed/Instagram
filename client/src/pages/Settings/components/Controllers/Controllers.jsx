import { Link, useParams } from "react-router-dom";
import style from "./Controllers.module.css";

const Controllers = () => {
  const { tab } = useParams();

  return (
    <nav className={style.controllers}>
      <Link
        to={`/settings/createdPosts`}
        className={
          tab === undefined || tab === "createdPosts" ? style.active : ""
        }
      >
        created posts
      </Link>
      <Link
        to={`/settings/savedPosts`}
        className={tab === "savedPosts" ? style.active : ""}
      >
        saved posts
      </Link>
      <Link
        to={`/settings/likedPosts`}
        className={tab === "likedPosts" ? style.active : ""}
      >
        liked posts
      </Link>
      <Link
        to={`/settings/followings`}
        className={tab === "followings" ? style.active : ""}
      >
        followings
      </Link>
      <Link
        to={`/settings/followers`}
        className={tab === "followers" ? style.active : ""}
      >
        followers
      </Link>
      <Link
        to={`/settings/createdComments`}
        className={tab === "createdComments" ? style.active : ""}
      >
        created comments
      </Link>
      <Link
        to={`/settings/reports`}
        className={tab === "reports" ? style.active : ""}
      >
        reports
      </Link>
    </nav>
  )
}

export default Controllers
