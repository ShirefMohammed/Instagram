// Modules
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
// Redux functions
import { setUser } from "../store/slices/userSlice";

const useHandleErrors = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const handleNoServerResponse = (err) => {
    if (!err?.response) {
      navigate(
        '/noServerResponse',
        { state: { from: location }, replace: true }
      );
    }
  }

  const handleServerError = (err) => {
    if (err?.response?.status === 500) {
      navigate(
        '/serverError',
        { state: { from: location }, replace: true }
      );
    }
  }

  const handleUnauthorized = (err) => {
    if (err?.response?.status === 401) {
      navigate(
        "/unauthorized",
        { state: { from: location }, replace: true }
      )
    }
  }

  const handleForbidden = (err) => {
    if (err?.response?.status === 403) {
      dispatch(setUser({ persist: user?.persist }));
      navigate(
        "/authentication",
        { state: { from: location }, replace: true }
      )
    }
  }

  const handleNoResourceFound = (err) => {
    if (err?.response?.status === 404) {
      navigate(
        "/noResourceFound",
        { state: { from: location }, replace: true }
      )
    }
  }

  return {
    handleNoServerResponse,
    handleServerError,
    handleUnauthorized,
    handleForbidden,
    handleNoResourceFound,
  };
}

export default useHandleErrors
