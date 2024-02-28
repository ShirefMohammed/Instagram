import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faHouse,
  faMagnifyingGlass,
  faBell,
  faSquarePlus,
  faBars,
  faLocationArrow,
  faArrowRightToBracket,
  faGear,
  faBookmark,
  faFileCircleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { useLogout } from "../../../../hooks";
import instagramSvgText from "../../../../assets/instagramSvgText.png";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./Sidebar.module.css";

const Sidebar = () => {
  const { pathname } = useLocation();

  const user = useSelector(state => state.user);

  const [openMoreList, setOpenMoreList] = useState(false);

  const logout = useLogout();

  return (
    <aside className={style.sidebar}>
      <Link to="/" className={style.logo}>
        <img src={instagramSvgText} alt="instagram" />
      </Link>

      <nav>
        <ul className={style.links}>
          <li>
            <Link
              to="/"
              className={pathname === "/" ? style.active : ""}
            >
              <FontAwesomeIcon icon={faHouse} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/search"
              className={pathname === "/search" ? style.active : ""}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <span>Search</span>
            </Link>
          </li>
          <li>
            <Link
              to="/explore"
              className={pathname === "/explore" ? style.active : ""}
            >
              <FontAwesomeIcon icon={faCompass} />
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              to="/chat"
              className={pathname === "/chat" ? style.active : ""}>
              <FontAwesomeIcon icon={faLocationArrow} />
              <span>Chat</span>
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className={pathname == "/notifications" ? style.active : ""}>
              <FontAwesomeIcon icon={faBell} />
              <span>Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              to="/createPost"
              className={pathname === "/createPost" ? style.active : ""}
            >
              <FontAwesomeIcon icon={faSquarePlus} />
              <span>Create</span>
            </Link>
          </li>
          {
            user?.accessToken ?
              (<li>
                <Link
                  to={`/users/${user?._id}`}
                  className={pathname === `/users/${user?._id}` ? style.active : ""}
                >
                  <img
                    className={style.avatar}
                    src={user?.avatar ? user.avatar : defaultAvatar}
                    alt="avatar"
                  />
                  <span>Profile</span>
                </Link>
              </li>)
              : (<li>
                <Link
                  to="/authentication"
                  className={pathname === "/authentication" ? style.active : ""}
                >
                  <FontAwesomeIcon icon={faArrowRightToBracket} />
                  <span>login</span>
                </Link>
              </li>)
          }
        </ul>
      </nav>

      <div className={style.more_list}>
        {
          openMoreList ?
            (<nav className={style.fade_up}>
              <ul className={style.links}>
                <li>
                  <Link
                    to="/settings"
                    className={pathname === "/settings" ? style.active : ""}
                    onClick={() => setOpenMoreList(false)}
                  >
                    <FontAwesomeIcon icon={faGear} />
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings/savedPosts"
                    className={pathname === "/settings/savedPosts" ? style.active : ""}
                    onClick={() => setOpenMoreList(false)}
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                    <span>Saved</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/createReport"
                    className={pathname === "/createReport" ? style.active : ""}
                    onClick={() => setOpenMoreList(false)}
                  >
                    <FontAwesomeIcon icon={faFileCircleExclamation} />
                    <span>Report</span>
                  </Link>
                </li>
                {
                  user?.accessToken &&
                  (<li>
                    <Link
                      to="/"
                      onClick={() => {
                        setOpenMoreList(false);
                        logout();
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowRightToBracket} />
                      <span>logout</span>
                    </Link>
                  </li>)
                }
              </ul>
            </nav>)
            : ("")
        }

        <button
          className={style.more_btn}
          type="button"
          onClick={() => setOpenMoreList(prev => !prev)}
        >
          <FontAwesomeIcon icon={faBars} />
          <span>More</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
