/* eslint-disable react/prop-types */
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

const RequireAuth = ({ allowedRoles }) => {
  const user = useSelector(state => state.user);
  const location = useLocation();

  const decoded = user?.accessToken ? jwtDecode(user?.accessToken) : undefined;
  const roles = decoded?.userInfo?.roles || [];

  return (
    roles?.some(role => allowedRoles?.includes(role)) ? <Outlet />
      : user?.accessToken
        ? <Navigate to="/unauthorized" state={{ from: location }} replace />
        : <Navigate to="/authentication" state={{ from: location }} replace />
  );
}

export default RequireAuth;