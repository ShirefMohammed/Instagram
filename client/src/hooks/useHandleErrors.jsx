import { useLocation, useNavigate } from "react-router-dom";

const useHandleErrors = () => {
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

  const handleNoResourceFound = (err) => {
    if (err?.response?.status === 404) {
      navigate(
        "/noResourceFound",
        { state: { from: location }, replace: true }
      )
    }
  }

  const handleErrors = (err) => {
    handleNoServerResponse(err);
    handleServerError(err);
    handleUnauthorized(err);
    handleNoResourceFound(err);
  }

  return handleErrors;
}

export default useHandleErrors
