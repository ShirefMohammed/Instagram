/* eslint-disable react/prop-types */
import { useState } from "react";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import style from "./UpdateGroup.module.css";

const UpdateGroup = ({ selectedChat, setSelectedChat, chats, setChats, setOpenChatInfo, setOpenUpdateGroup }) => {
  const user = useSelector(state => state.user);

  const [searchKey, setSearchKey] = useState("");
  const [searchLoad, setSearchLoad] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);

  const [users, setUsers] = useState(selectedChat.users);
  const [groupName, setGroupName] = useState(selectedChat.groupName);

  const [updateGroupLoad, setUpdateGroupLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const search = async () => {
    try {
      setSearchLoad(true);

      if (!searchKey) return setSearchUsers([]);

      const res = await axiosPrivate.get(
        `users/search?searchKey=${searchKey}&&limit=30`
      );

      setSearchUsers(res.data.data);
    }

    catch (err) {
      handleErrors(err);
    }

    finally {
      setSearchLoad(false);
    }
  }

  const UpdateGroupChat = async () => {
    try {
      if (!groupName) {
        return notify("info", "Group name is required");
      }

      if (users.length < 2) {
        return notify("info", "Two users are required at least");
      }

      let groupUsers = users.map(user => user._id);

      if (!groupUsers.includes(user?._id)) {
        return notify("info", "Don't except yourself");
      }

      setUpdateGroupLoad(true);

      const res = await axiosPrivate.patch(
        `/chats/${selectedChat._id}`,
        {
          users: groupUsers,
          isGroupChat: true,
          groupName: groupName,
        }
      );

      const updatedChat = res.data.data;

      setChats(
        chats.map((chat) => {
          if (chat._id == updatedChat._id)
            return updatedChat;
          else
            return chat;
        })
      );

      setSelectedChat(updatedChat);

      notify("success", "Group is updated");
    }

    catch (err) {
      handleErrors(err);
    }

    finally {
      setUpdateGroupLoad(false);
    }
  }

  return (
    <div className={style.update_group_chat}>
      <form
        className={style.container}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2>Update Group Chat</h2>

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
                  users.map((userData) => (
                    <div
                      key={userData._id}
                      className={style.user_card}
                    >
                      <span>{userData.name}</span>
                      <button
                        type="button"
                        title="remove"
                        onClick={() => setUsers(users.filter(item => item._id !== userData._id))}
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
            title="search"
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
                          if (!users.some(item => item._id === userData._id)) {
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
          className={style.update_btn}
          disabled={updateGroupLoad ? true : false}
          style={updateGroupLoad ? { cursor: "none" } : {}}
          onClick={UpdateGroupChat}
        >
          <span>Save Updates</span>
          {updateGroupLoad ? <MoonLoader color="#000" size={15} /> : ""}
        </button>

        <button
          type="button"
          title="close"
          className={style.close_btn}
          onClick={() => {
            setOpenUpdateGroup(false);
            setOpenChatInfo(true);
          }}
        >
          <FontAwesomeIcon icon={faX} />
        </button>
      </form>
    </div>
  )
}

export default UpdateGroup