import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useRefreshToken } from "../hooks";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";

const PersistLogin = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.user);
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
        !user?.persist ? <Outlet />
          : loading ?
            (<div
              style={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <MoonLoader color="#000" size={25} />
            </div>)
            : (<Outlet />)
      }
    </>
  )
}

export default PersistLogin
