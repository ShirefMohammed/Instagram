import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHandleErrors } from "../../../../hooks";
import UsersViewer from "../UsersViewer/UsersViewer";
import style from "./Followers.module.css";
import axios from "../../../../api/axios";

const Followers = () => {
  const user = useSelector(state => state.user);

  const usersLimit = 10;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(false);

  const removeUserType = "removeFollower";
  const handleErrors = useHandleErrors();

  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axios.get(
          `/users/${user?._id}/followers?page=${usersPage}&limit=${usersLimit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(
          err,
          [
            "handleNoServerResponse",
            "handleServerError",
            "handleUnauthorized",
            "handleExpiredRefreshToken",
            "handleNoResourceFound"
          ]
        );
      } finally {
        setFetchUsersLoad(false);
      }
    }
    fetchFollowers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.followers}`}>
      {/* Users cards */}
      <UsersViewer
        users={users}
        setUsers={setUsers}
        limit={usersLimit}
        page={usersPage}
        setPage={setUsersPage}
        fetchUsersLoad={fetchUsersLoad}
        setFetchUsersLoad={setFetchUsersLoad}
        removeUserType={removeUserType}
      />
    </div>
  )
}

export default Followers
