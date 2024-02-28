/* eslint-disable react/prop-types */
import { useState } from "react";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import style from "./UpdateGroup.module.css";

const UpdateGroup = (
  {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    setOpenChatInfo,
    setOpenUpdateGroup
  }
) => {
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
    } catch (err) {
      handleErrors(
        err,
        [
          "handleNoServerResponse",
          "handleServerError",
          "handleUnauthorized",
          "handleExpiredRefreshToken",
          "handleNoResourceFound"
        ]
      );
    } finally {
      setSearchLoad(false);
    }
  }

  const UpdateGroupChat = async () => {
    try {
      if (!groupName) {
        return notify("info", "Group name is requires");
      }

      let groupUsers = users.map(user => user._id);

      if (groupUsers.length < 1) {
        return notify("info", "One user is required at least");
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
          if (chat._id == updatedChat._id) return updatedChat;
          else return chat;
        })
      );

      setSelectedChat(updatedChat);

      notify("success", "Group is updated");
    }

    catch (err) {
      handleErrors(
        err,
        [
          "handleNoServerResponse",
          "handleServerError",
          "handleUnauthorized",
          "handleExpiredRefreshToken",
          "handleNoResourceFound"
        ]
      );
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
        {/* Page Title */}
        <h2>Update Group Chat</h2>

        {/* Group Name Input */}
        <input
          type="text"
          name="groupName"
          id="groupName"
          placeholder="Enter group name"
          required={true}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* Selected users */}
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
                        onClick={
                          () => setUsers(users.filter(u => u._id !== user._id))
                        }
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

        {/* Search */}
        <div className={style.search_input}>
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

        {/* Search Results */}
        <>
          {
            // While fetching search results
            searchLoad ?
              (<div className={style.spinner_container}>
                <MoonLoader color="#000" size={20} />
              </div>)

              // If There is search results
              : searchUsers?.length > 0 ?
                (<div className={style.search_result_container}>
                  {
                    searchUsers.map((user) => (
                      <div
                        key={user._id}
                        className={style.user_card}
                        onClick={() => {
                          if (!users.some(u => u._id === user._id)) {
                            setUsers([...users, user]);
                          }
                        }}
                      >
                        <img src={user.avatar} alt="avatar" />
                        <span>{user.name}</span>
                      </div>
                    ))
                  }
                </div>)

                // If There is no search results
                : (<div className={style.start_search_msg}>
                  Start searching and chat
                </div>)
          }
        </>

        {/* Save UpdatesBtn  */}
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

        {/* Close Btn */}
        <button
          type="button"
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
