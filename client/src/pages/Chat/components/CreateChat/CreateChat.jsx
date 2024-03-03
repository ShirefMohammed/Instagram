/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import style from "./CreateChat.module.css";

const CreateChat = ({ chats, setChats, setOpenCreateChat, setOpenCreateGroup }) => {
  const user = useSelector(state => state.user);

  const [searchKey, setSearchKey] = useState("");
  const [searchLoad, setSearchLoad] = useState(false);

  const [users, setUsers] = useState([]); // search results

  const [createChatLoad, setCreateChatLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const navigate = useNavigate();

  const search = async () => {
    try {
      setSearchLoad(true);

      if (!searchKey) return setUsers([]);

      const res = await axiosPrivate.get(
        `users/search?searchKey=${searchKey}&&limit=30`
      );

      setUsers(res.data.data);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchLoad(false);
    }
  }

  const createChat = async (userId) => {
    try {
      if (user?._id === userId) return notify("info", "You can not chat with yourself");

      setCreateChatLoad(true);

      const res = await axiosPrivate.post(
        `/chats`,
        {
          users: [userId],
          isGroupChat: false,
        }
      );

      const newChat = res.data.data;

      if (!chats.some(chat => chat._id == newChat._id)) {
        setChats([newChat, ...chats]);
      }

      navigate(`/chat/${newChat._id}`);

      setOpenCreateChat(false);
    } catch (err) {
      handleErrors(err);
    } finally {
      setCreateChatLoad(false);
    }
  }

  return (
    <div className={style.create_chat}>
      <form
        className={style.container}
        style={createChatLoad ? { overflow: "hidden" } : {}}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2>Create Single Chat</h2>

        <div className={style.search}>
          <input
            type="search"
            name="searchKey"
            id="searchKey"
            placeholder="Search by user name or email"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />

          <button
            type="button"
            onClick={search}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        <>
          {
            searchLoad ?
              (<div className={style.spinner_container}>
                <MoonLoader color="#000" size={20} />
              </div>)

              : users?.length > 0 ?
                (<div className={style.search_result_container}>
                  {
                    users.map((user) => (
                      <div
                        key={user._id}
                        className={style.user_card}
                        onClick={() => createChat(user._id)}
                      >
                        <img src={user.avatar} alt="" />
                        <span>{user.name}</span>
                      </div>
                    ))
                  }
                </div>)

                : (<div className={style.start_search_msg}>
                  Start searching and chat
                </div>)
          }
        </>

        <button
          type="button"
          className={style.create_group_chat_btn}
          onClick={() => {
            setOpenCreateChat(false);
            setOpenCreateGroup(true);
          }}
        >
          create group chat
        </button>

        <button
          type="button"
          className={style.close_btn}
          onClick={() => setOpenCreateChat(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        <>
          {
            createChatLoad ?
              (<div className={style.create_chat_loading_container}>
                <MoonLoader color="#000" size={40} />
              </div>)
              : ("")
          }
        </>
      </form>
    </div>
  )
}

export default CreateChat