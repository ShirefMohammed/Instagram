import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./Followings.module.css";

const Followings = () => {
  const user = useSelector(state => state.user);

  const [followings, setFollowings] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  useEffect(() => {
    const fetchFollowingsUsers = async () => {
      try {
        if (!user?.accessToken) return null;

        setFetchUsersLoad(true);

        const res = await axiosPrivate.get(
          `/users/${user?._id}/followings`
        );

        setFollowings(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUsersLoad(false);
      }
    }
    fetchFollowingsUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.followings}>
      {
        fetchUsersLoad ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)

          : followings.length > 0 ?
            (<ul>
              {
                followings.map((following) => (
                  <li key={following?._id}>
                    <Link
                      to={`users/${following?._id}`}
                      title={following?.name}
                    >
                      <img
                        src={following?.avatar || defaultAvatar}
                        alt=""
                      />
                    </Link>
                  </li>
                ))
              }
            </ul>)

            : ("")
      }
    </div>
  )
}

export default Followings
