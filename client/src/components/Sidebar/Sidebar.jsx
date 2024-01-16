// Modules
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
  faFileCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
// Hooks
import { useLogout } from "../../hooks";
// Images
import instagramSvgText from "../../assets/instagramSvgText.png";
import defaultAvatar from "../../assets/defaultAvatar.png";
// Css style
import style from "./Sidebar.module.css";

const Sidebar = () => {
  const [openMoreList, setOpenMoreList] = useState(false);
  const user = useSelector(state => state.user);
  const { pathname } = useLocation();
  const logout = useLogout();

  return (
    <aside className={style.sidebar}>
      {/* Logo */}
      <Link to="/" className={style.logo}>
        <img src={instagramSvgText} alt="instagram" />
      </Link>

      {/* Links */}
      <nav>
        <ul className={style.links}>
          <li>
            <Link
              to="/"
              className={pathname === "/" ? style.active_link : ""}
            >
              <FontAwesomeIcon icon={faHouse} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/search"
              className={pathname === "/search" ? style.active_link : ""}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <span>Search</span>
            </Link>
          </li>
          <li>
            <Link
              to="/explore"
              className={pathname === "/explore" ? style.active_link : ""}
            >
              <FontAwesomeIcon icon={faCompass} />
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              to="/chat"
              className={pathname === "/chat" ? style.active_link : ""}>
              <FontAwesomeIcon icon={faLocationArrow} />
              <span>Chat</span>
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className={pathname == "/notifications" ? style.active_link : ""}>
              <FontAwesomeIcon icon={faBell} />
              <span>Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              to="/createPost"
              className={pathname === "/createPost" ? style.active_link : ""}
            >
              <FontAwesomeIcon icon={faSquarePlus} />
              <span>Create</span>
            </Link>
          </li>
          {
            user?.accessToken ?
              (<li>
                <Link
                  to="/profile"
                  className={pathname === "/profile" ? style.active_link : ""}
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
                  className={pathname === "/authentication" ? style.active_link : ""}
                >
                  <FontAwesomeIcon icon={faArrowRightToBracket} />
                  <span>login</span>
                </Link>
              </li>)
          }
        </ul>
      </nav>

      {/* More Links */}
      <div className={style.more_list}>
        {
          openMoreList &&
          <nav className="fade_up">
            <ul className={style.links}>
              <li>
                <Link
                  to="/settings"
                  className={pathname === "/settings" ? style.active_link : ""}
                >
                  <FontAwesomeIcon icon={faGear} />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings/saved"
                  className={pathname === "/settings/saved" ? style.active_link : ""}
                >
                  <FontAwesomeIcon icon={faBookmark} />
                  <span>Saved</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/createReport"
                  className={pathname === "/createReport" ? style.active_link : ""}
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
                    onClick={logout}
                  >
                    <FontAwesomeIcon icon={faArrowRightToBracket} />
                    <span>logout</span>
                  </Link>
                </li>)
              }
            </ul>
          </nav>
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
