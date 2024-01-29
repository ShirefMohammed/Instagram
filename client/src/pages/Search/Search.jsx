// Modules
import { useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
// Hooks
import { useAxiosPrivate, useHandleErrors } from "../../hooks";
// Css style
import style from "./Search.module.css";
// Images
import defaultAvatar from "../../assets/defaultAvatar.png";

const Search = () => {
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState("");
  const [users, setUsers] = useState([]);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  // Search about users
  const search = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axiosPrivate.get(
        `users/search?searchKey=${searchKey}&&limit=30`
      );
      setUsers(res?.data?.data);
    } catch (err) {
      handleErrors.handleNoServerResponse(err);
      handleErrors.handleServerError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={style.search}
      onSubmit={search}
    >
      {/* Page Title */}
      <h2>Search</h2>

      {/* Search Input */}
      <input
        type="search"
        name="searchKey"
        id="searchKey"
        required={true}
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
      />

      {/* Search Results */}
      <>
        {
          // While fetching search results
          loading ?
            <div className={style.spinner_container}>
              <MoonLoader color="#000" size={20} />
            </div>

            // If There is search results
            : users?.length > 0 ?
              <div className={style.search_result_container}>
                {
                  users.map((user) =>
                    user?._id ?
                      (<div key={user._id} className={style.user_card}>
                        <img src={user?.avatar || defaultAvatar} alt="avatar" />
                        <Link to={`/users/${user?._id}`}>{user?.name}</Link>
                      </div>)
                      : ""
                  )
                }
              </div>

              // If There is no search results
              : <div style={{ textAlign: "center" }}>
                Start searching about any user
              </div>
        }
      </>
    </form>
  )
}

export default Search
