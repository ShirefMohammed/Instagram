import { useState } from "react";
import { MoonLoader } from "react-spinners";
import { UserCard } from "../../components";
import { useAxiosPrivate } from "../../hooks";
import style from "./Search.module.css";

const Search = () => {
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState("");
  const [users, setUsers] = useState([]);
  const axiosPrivate = useAxiosPrivate();

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
      console.log(err);
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
                  <UserCard key={user?._id} user={user} />
                )
              }
            </div>

            // If There is no search results
            : <div style={{ textAlign: "center" }}>
              Start searching about any user
            </div>
      }
    </form>
  )
}

export default Search
