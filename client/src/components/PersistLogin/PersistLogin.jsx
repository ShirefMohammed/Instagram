import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRefreshToken } from "../../hooks";
import { FirstReqLoadingMsg } from "../";
import style from "./PersistLogin.module.css";
import InstagramSvgIcon from "../../assets/InstagramSvgIcon.svg";

const PersistLogin = () => {
  const user = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);

  const refresh = useRefreshToken();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        if (user?.persist && !user?.accessToken) {
          setLoading(true);
          await refresh();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    verifyRefreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {
        // If no need to remember user
        !user?.persist ? (
          <Outlet />
        ) : // If refresh is loading to fetch accessToken by jwt
        loading ? (
          <div className={style.loading_container}>
            {/* Server First Request Loading Message */}
            <FirstReqLoadingMsg />
            <img src={InstagramSvgIcon} alt="Instagram_Icon" />
            <div className={style.creator}>
              <span>Created by</span>
              <Link to="https://shiref-mohammed.onrender.com/">
                Shiref Mohammed
              </Link>
            </div>
          </div>
        ) : (
          // If refresh finished loading
          <Outlet />
        )
      }
    </>
  );
};

export default PersistLogin;
