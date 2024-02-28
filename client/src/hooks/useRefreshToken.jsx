import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import axios from '../api/axios';

const useRefreshToken = () => {
  const user = useSelector(state => state.user);

  const dispatch = useDispatch();

  const refresh = async () => {
    const res = await axios.get(
      '/auth/refresh',
      { withCredentials: true }
    );

    dispatch(setUser({ ...user, ...res.data.data }));

    return res.data.data.accessToken;
  }

  return refresh;
};

export default useRefreshToken;
