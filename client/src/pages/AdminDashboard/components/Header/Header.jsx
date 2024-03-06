import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import style from "./Header.module.css";

const Header = () => {
  const { tab } = useParams();

  const [pageTitle, setPageTitle] = useState("Admin Dashboard / Posts");
  const [openLinksList, setOpenLinksList] = useState(false);

  // Set page title
  useEffect(() => {
    if (tab === undefined) {
      setPageTitle("Admin Dashboard / Posts");
    } else if (tab === "posts") {
      setPageTitle("Admin Dashboard / Posts");
    } else if (tab === "users") {
      setPageTitle("Admin Dashboard / Users");
    } else if (tab === "reports") {
      setPageTitle("Admin Dashboard / Reports");
    }
  }, [tab]);

  return (
    <header className={style.header}>
      <h2>{pageTitle}</h2>

      <nav className={style.links}>
        <button
          type="button"
          title="options"
          className={style.toggle_links_list_btn}
          onClick={() => setOpenLinksList(prev => !prev)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <>
          {
            openLinksList ?
              (<ul className={`${style.links_list} ${style.fade_up}`}>
                <li>
                  <Link
                    to="/adminDashboard/posts"
                    className={tab === undefined || tab === "posts" ? style.active : ""}
                    onClick={() => setOpenLinksList(false)}
                  >
                    <span>Posts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/adminDashboard/users"
                    className={tab === "users" ? style.active : ""}
                    onClick={() => setOpenLinksList(false)}
                  >
                    <span>Users</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/adminDashboard/reports"
                    className={tab === "reports" ? style.active : ""}
                    onClick={() => setOpenLinksList(false)}
                  >
                    <span>Reports</span>
                  </Link>
                </li>
              </ul>)
              : ("")
          }
        </>
      </nav>
    </header>
  )
}

export default Header