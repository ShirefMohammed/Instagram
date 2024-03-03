import { useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useHandleErrors } from "../../hooks";
import style from "./Search.module.css";
import defaultAvatar from "../../assets/defaultAvatar.png";
import axios from "../../api/axios";

const Search = () => {
  const [searchKey, setSearchKey] = useState("");
  const [searchLoad, setSearchLoad] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleErrors = useHandleErrors();

  const search = async () => {
    try {
      if (searchKey === "") return setSearchResults([]);
      setSearchLoad(true);
      const res = await axios.get(
        `users/search?searchKey=${searchKey}&&limit=30`
      );
      setSearchResults(res.data.data);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchLoad(false);
    }
  }

  return (
    <div className={style.search}>
      <h2>Search in Instagram</h2>

      <div className={style.search_controllers}>
        <input
          type="search"
          name="searchKey"
          id="searchKey"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search for users"
        />

        <button
          type="button"
          onClick={search}
          title="search"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>

      <div className={style.search_result_container}>
        {
          searchLoad ?
            (<div className={style.spinner_container}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : searchResults.length > 0 ?
              (<ul className={style.search_result_list}>
                {
                  searchResults.map((user) => (
                    <li key={user._id} className={style.user_card}>
                      <img src={user?.avatar || defaultAvatar} alt="" />
                      <Link to={`/users/${user?._id}`}>{user?.name}</Link>
                    </li>
                  ))
                }
              </ul>)

              : (<p className={style.startup_msg}>
                Search for any user and start communication with him
              </p>)
        }
      </div>
    </div>
  )
}

export default Search
