/* eslint-disable react/prop-types */
import { MoonLoader, PuffLoader } from "react-spinners";
import UserCard from "../UserCard/UserCard";
import style from "./UsersViewer.module.css";

const UsersViewer = (
  {
    users,
    setUsers,
    limit,
    page,
    setPage,
    fetchUsersLoad,
    setFetchUsersLoad,
    removeUserType
  }
) => {
  return (
    <div className={`${style.users_viewer}`}>
      {/* Users viewer section */}
      <>
        {
          // While fetching users and users length is 0
          fetchUsersLoad && users.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If users have been fetched
            : users.length > 0 ?
              (<div className={style.viewer}>
                {
                  users?.length && users.map((userData) => (
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

      {/* Load more users btn section */}
      <>
        {
          fetchUsersLoad && users.length === 0 ? ("")

            // While fetching users || If there are users in db
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

              // If user reaches last user
              : page * limit > users.length ?
                (<p className={style.no_more_users_message}>
                  This section has {users.length} users
                </p>)

                // No thing
                : ("")
        }
      </>
    </div>
  )
}

export default UsersViewer
