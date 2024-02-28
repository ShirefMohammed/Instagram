import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import SuggestedUserCard from "../SuggestedUserCard/SuggestedUserCard";
import style from "./SuggestedUsers.module.css";

const SuggestedUsers = () => {
  const user = useSelector(state => state.user);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        if (!user?.accessToken) return null;
        const res = await axiosPrivate.get("/users/suggest");
        setSuggestedUsers(res.data.data);
      } catch (err) {
        handleErrors(err);
      }
    }
    fetchSuggestedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.suggested_users}>
      <h2>Suggested for you</h2>

      <ul>
        {
          suggestedUsers.map((suggestedUser) => (
            <li key={suggestedUser._id}>
              <SuggestedUserCard
                suggestedUser={suggestedUser}
                followedUsers={followedUsers}
                setFollowedUsers={setFollowedUsers}
              />
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default SuggestedUsers
