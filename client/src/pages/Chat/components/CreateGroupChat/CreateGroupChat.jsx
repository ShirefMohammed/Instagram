/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import style from "./CreateGroupChat.module.css";

const CreateGroupChat = ({ chats, setChats, setOpenCreateChat, setOpenCreateGroup }) => {
  const user = useSelector(state => state.user);

  const [searchKey, setSearchKey] = useState("");
  const [searchLoad, setSearchLoad] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);

  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const [createGroupLoad, setCreateGroupLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const navigate = useNavigate();

  const search = async () => {
    try {
      setSearchLoad(true);

      if (!searchKey) return setSearchUsers([]);

      const res = await axiosPrivate.get(
        `users/search?searchKey=${searchKey}&&limit=30`
      );

      setSearchUsers(res.data.data);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchLoad(false);
    }
  }

  const createGroupChat = async () => {
    try {
      if (!groupName) {
        return notify("info", "Group name is requires");
      }

      if (users.length < 1) {
        return notify("info", "One user is required at least");
      }

      let groupUsers = users.map(user => user._id);

      setCreateGroupLoad(true);

      const res = await axiosPrivate.post(
        `/chats`,
        {
          users: groupUsers,
          isGroupChat: true,
          groupName: groupName,
        }
      );

      const newChat = res.data.data;

      setChats([newChat, ...chats]);

      navigate(`/chat/${newChat._id}`);

      setOpenCreateGroup(false);
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Group is not created");
    }

    finally {
      setCreateGroupLoad(false);
    }
  }

  return (
    <div className={style.create_group_chat}>
      <form
        className={style.container}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2>Create Group Chat</h2>

        <input
          type="text"
          name="groupName"
          id="groupName"
          placeholder="Enter group name"
          required={true}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <>
          {
            users.length > 0 ?
              (<div className={style.selected_users}>
                {
                  users.map((user) => (
                    <div
                      key={user._id}
                      className={style.user_card}
                    >
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => setUsers(users.filter(u => u._id !== user._id))}
                      >
                        <FontAwesomeIcon icon={faX} />
                      </button>
                    </div>
                  ))
                }
              </div>)
              : ("")
          }
        </>

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

              : searchUsers?.length > 0 ?
                (<div className={style.search_result_container}>
                  {
                    searchUsers.map((userData) => (
                      <div
                        key={userData._id}
                        className={style.user_card}
                        onClick={() => {
                          if (
                            !users.some(item => item._id === userData._id)
                            && userData._id !== user._id
                          ) {
                            setUsers([...users, userData]);
                          }
                        }}
                      >
                        <img src={userData.avatar} alt="" />
                        <span>{userData.name}</span>
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
          className={style.create_btn}
          disabled={createGroupLoad ? true : false}
          style={createGroupLoad ? { cursor: "none" } : {}}
          onClick={createGroupChat}
        >
          <span>Create Group Chat</span>
          {createGroupLoad ? <MoonLoader color="#000" size={15} /> : ""}
        </button>

        <button
          type="button"
          className={style.create_single_chat_btn}
          onClick={() => {
            setOpenCreateGroup(false);
            setOpenCreateChat(true);
          }}
        >
          create single chat
        </button>

        <button
          type="button"
          className={style.close_btn}
          onClick={() => setOpenCreateGroup(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>
      </form>
    </div>
  )
}

export default CreateGroupChat