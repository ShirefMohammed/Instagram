import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLogout, useRefreshToken } from "../hooks";
import { axiosPrivate } from "../api/axios";

const useAxiosPrivate = () => {
  const user = useSelector(state => state.user);
  
  const refresh = useRefreshToken();
  const logout = useLogout();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${user?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (
          error?.response?.status === 403
          && error?.response?.data?.status === "AccessTokenExpiredError"
          && !prevRequest?.sent
        ) {
          try {
            prevRequest.sent = true;
            const newAccessToken = await refresh();
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            if (
              refreshError?.response?.status === 403
              && refreshError?.response?.data?.status === "RefreshTokenExpiredError"
            ) {
              logout();
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return axiosPrivate;
}

export default useAxiosPrivate;
