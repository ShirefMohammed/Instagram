/* eslint-disable react/prop-types */
import { MoonLoader, PuffLoader } from "react-spinners";
import UserCard from "../UserCard/UserCard";
import style from "./UsersViewer.module.css";

const UsersViewer = ({ users, setUsers, limit, page, setPage, fetchUsersLoad, setFetchUsersLoad, removeUserType }) => {
  return (
    <div className={`${style.users_viewer}`}>
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
                      removeUserType={removeUserType}
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

            : fetchUsersLoad || page * limit === users.length ?
              (<button
                type="button"
                className={style.load_more_users_btn}
                disabled={fetchUsersLoad ? true : false}
                style={fetchUsersLoad ? { cursor: "revert" } : {}}
                onClick={() => {
                  setFetchUsersLoad(true)
                  setPage(prev => prev + 1)
                }}
              >
                {
                  fetchUsersLoad ?
                    <PuffLoader color="#000" size={15} />
                    : "More"
                }
              </button>)

              : page * limit > users.length ?
                (<p className={style.no_more_users_message}>
                  This section has {users.length} users
                </p>)

                : ("")
        }
      </>
    </div>
  )
}

export default UsersViewer