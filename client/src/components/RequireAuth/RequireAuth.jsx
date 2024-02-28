/* eslint-disable react/prop-types */
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RequireAuth = ({ allowedRoles }) => {
  const user = useSelector(state => state.user);

  const location = useLocation();

  return (
    user?.roles?.some(role => allowedRoles?.includes(role)) ? <Outlet />
      : user?.accessToken
        ? <Navigate to="/unauthorized" state={{ from: location }} replace />
        : <Navigate to="/authentication" state={{ from: location }} replace />
  );
}

export default RequireAuth;