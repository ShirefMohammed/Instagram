/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import style from "./ChatInformation.module.css";

const ChatInformation = ({ selectedChat, chats, setChats, setOpenChatInfo, setOpenUpdateGroup }) => {
  const user = useSelector(state => state.user);

  const [deleteChatLoad, setDeleteChatLoad] = useState(false);
  const [leaveGroupLoad, setLeaveGroupLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const navigate = useNavigate();

  const DeleteTheChat = async () => {
    try {
      setDeleteChatLoad(true);

      await axiosPrivate.delete(`/chats/${selectedChat._id}`);

      setChats(chats.filter(chat => chat._id !== selectedChat._id));

      notify("success", "Chat is deleted");

      setOpenChatInfo(false);

      navigate("/chat");
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteChatLoad(false);
    }
  }

  const LeaveTheGroup = async () => {
    try {
      setLeaveGroupLoad(true);

      await axiosPrivate.delete(`/chats/${selectedChat._id}/users`);

      setChats(chats.filter(chat => chat._id !== selectedChat._id));

      notify("success", "You left the group");

      setOpenChatInfo(false);

      navigate("/chat");
    } catch (err) {
      handleErrors(err);
    } finally {
      setLeaveGroupLoad(false);
    }
  }

  return (
    <div className={style.chat_info}>
      <div className={style.container}>
        {/* Title */}
        <h2>Chat Information</h2>

        {/* Chat details */}
        <div className={style.chat_details}>
          <h3>Details</h3>

          <p>
            Chat type: {selectedChat.isGroupChat ? "group chat" : "single chat"}
          </p>

          <p>
            Chat users: {selectedChat.users.length}
          </p>

          <>
            {
              selectedChat.isGroupChat ?
                (<p>
                  Group name: {selectedChat.groupName}
                </p>)
                : ("")
            }
          </>

          <>
            {
              selectedChat.isGroupChat ?
                (<p>
                  Group admin: {selectedChat.groupAdmin.name}
                </p>)
                : ("")
            }
          </>
        </div>

        {/* Chat users */}
        <div className={style.chat_users}>
          <h3>Users</h3>

          <div className={style.users_container}>
            {
              selectedChat.users.map((user) => (
                <div
                  key={user._id}
                  className={style.user_card}
                >
                  <img src={user.avatar} alt="" />
                  <span>{user.name}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Chat controllers */}
        <div className={style.chat_controllers}>
          <h3>Controllers</h3>

          {/* Delete chat btn */}
          <>
            {
              !selectedChat.isGroupChat ?
                (<button
                  type="button"
                  className={style.delete_chat_btn}
                  disabled={deleteChatLoad ? true : false}
                  style={deleteChatLoad ? { cursor: "revert", opacity: ".5" } : {}}
                  onClick={DeleteTheChat}
                >
                  <span>Delete this chat</span>
                  {deleteChatLoad ? <PuffLoader color="#fff" size={10} /> : ""}
                </button>)
                : ("")
            }
          </>

          {/* Delete group btn */}
          <>
            {
              (
                selectedChat.isGroupChat
                && selectedChat.groupAdmin._id === user._id
              ) ?
                (<button
                  type="button"
                  className={style.delete_group_btn}
                  disabled={deleteChatLoad ? true : false}
                  style={deleteChatLoad ? { cursor: "revert", opacity: ".5" } : {}}
                  onClick={DeleteTheChat}
                >
                  <span>Delete this group</span>
                  {deleteChatLoad ? <PuffLoader color="#fff" size={10} /> : ""}
                </button>)
                : ("")
            }
          </>

          {/* Leave group btn */}
          <>
            {
              selectedChat.isGroupChat ?
                (<button
                  type="button"
                  className={style.leave_group_btn}
                  disabled={leaveGroupLoad ? true : false}
                  style={leaveGroupLoad ? { cursor: "revert", opacity: ".5" } : {}}
                  onClick={LeaveTheGroup}
                >
                  <span>Leave this group</span>
                  {leaveGroupLoad ? <PuffLoader color="#fff" size={10} /> : ""}
                </button>)
                : ("")
            }
          </>

          {/* update group btn */}
          <>
            {
              (
                selectedChat.isGroupChat
                && selectedChat.groupAdmin._id === user._id
              ) ?
                (<button
                  type="button"
                  className={style.update_group_btn}
                  onClick={() => {
                    setOpenChatInfo(false);
                    setOpenUpdateGroup(true);
                  }}
                >
                  <span>Update this group</span>
                </button>)
                : ("")
            }
          </>
        </div>

        {/* Close btn */}
        <button
          type="button"
          title="close"
          className={style.close_btn}
          onClick={() => setOpenChatInfo(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>
      </div>
    </div>
  )
}

export default ChatInformation