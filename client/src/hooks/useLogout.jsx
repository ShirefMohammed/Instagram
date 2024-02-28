import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import axios from "../api/axios";

const useLogout = () => {
  const user = useSelector(state => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      dispatch(setUser({ persist: user?.persist }));
      await axios.get('/auth/logout', { withCredentials: true });
      navigate('/authentication');
    } catch (err) {
      console.error(err);
    }
  }

  return logout;
}

export default useLogout
