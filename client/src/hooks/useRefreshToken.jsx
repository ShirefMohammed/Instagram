// Modules
import { useSelector, useDispatch } from 'react-redux';
// Store
import { setUser } from '../store/slices/userSlice';
// Api axios
import axios from '../api/axios';

const useRefreshToken = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const refresh = async () => {
    const response = await axios.get(
      '/auth/refresh',
      { withCredentials: true }
    );

    const accessToken = response?.data?.data?.accessToken;
    const data = response?.data?.data;
    dispatch(setUser({ ...user, ...data }));

    return accessToken;
  }

  return refresh;
};

export default useRefreshToken;
