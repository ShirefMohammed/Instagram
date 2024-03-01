import { useEffect, useState } from "react";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import UserCard from "../UserCard/UserCard";
import style from "./Users.module.css";

const Users = () => {
  const limit = 10;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axiosPrivate.get(
          `/users?page=${usersPage}&limit=${limit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUsersLoad(false);
      }
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.users}`}>
      <>
        {
          fetchUsersLoad && users.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : users.length > 0 ?
              (<div className={style.viewer}>
                {
                  users.map((userData) => (
                    <UserCard
                      key={userData?._id}
                      userData={userData}
                      users={users}
                      setUsers={setUsers}
                    />
                  ))
                }
              </div>)

              : ("")
        }
      </>

      <>
        {
          fetchUsersLoad && users.length === 0 ? ("")

            : fetchUsersLoad || usersPage * limit === users.length ?
              (<button
                type="button"
                className={style.load_more_users_btn}
                disabled={fetchUsersLoad ? true : false}
                style={fetchUsersLoad ? { cursor: "revert" } : {}}
                onClick={() => {
                  setFetchUsersLoad(true)
                  setUsersPage(prev => prev + 1)
                }}
              >
                {
                  fetchUsersLoad ?
                    <PuffLoader color="#000" size={15} />
                    : "More"
                }
              </button>)

              : usersPage * limit > users.length ?
                (<p className={style.no_more_users_message}>
                  This section has {users.length} users
                </p>)

                : ("")
        }
      </>
    </div>
  )
}

export default Users