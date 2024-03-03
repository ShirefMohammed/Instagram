/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BeatLoader, MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import MessageCard from "../MessageCard/MessageCard";
import SendMessageController from "../SendMessageController/SendMessageController";
import ChatInformation from "../ChatInformation/ChatInformation";
import UpdateGroup from "../UpdateGroup/UpdateGroup";
import groupImage from "../../../../assets/groupImage.png";
import style from "./SelectedChat.module.css";

const SelectedChat = ({ chats, setChats, socket }) => {
  const { chatId } = useParams(); // selected chat id

  const user = useSelector(state => state.user);

  const [selectedChat, setSelectedChat] = useState({});
  const [fetchSelectedChatLoad, setFetchSelectedChatLoad] = useState({});

  const [anotherChatUser, setAnotherChatUser] = useState({});

  const [openChatInfo, setOpenChatInfo] = useState(false);
  const [openUpdateGroup, setOpenUpdateGroup] = useState(false);

  const [messages, setMessages] = useState([]);
  const [fetchMessagesLoad, setFetchMessagesLoad] = useState({});

  const [typing, setTyping] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectedChat = async () => {
      try {
        if (!chatId) return setSelectedChat({});
        setFetchSelectedChatLoad(true);
        const res = await axiosPrivate.get(`/chats/${chatId}`);
        setSelectedChat(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchSelectedChatLoad(false);
      }
    }
    fetchSelectedChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) return null;
        setFetchMessagesLoad(true);
        const res = await axiosPrivate.get(`/chats/${chatId}/messages`);
        setMessages(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchMessagesLoad(false);
      }
    }
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Set another user if single chat
  useEffect(() => {
    if (selectedChat?._id && !selectedChat.isGroupChat) {
      setAnotherChatUser(selectedChat.users.find(item => item._id != user._id));
    }
  }, [selectedChat, user._id]);

  // Join socket chat room
  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", chatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Receive message socket event
  useEffect(() => {
    socket.on("receiveMessage", (receivedMessage) => {
      if (chatId === receivedMessage.chat) {
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      }
    });

    return () => {
      // Clean up the socket event listener when the component unmounts
      socket.off("receiveMessage");
    };
  }, [chatId, socket]);

  // Delete message socket event
  useEffect(() => {
    socket.on("deleteMessage", (deletedMessage) => {
      if (chatId === deletedMessage.chat) {
        setMessages(prevMessages => prevMessages.filter(msg => msg._id !== deletedMessage._id));
      }
    });

    return () => {
      socket.off("deleteMessage");
    };
  }, [chatId, socket]);

  // Typing socket event
  useEffect(() => {
    socket.on("typing", (targetChatId) => {
      if (chatId === targetChatId) {
        setTyping(true);
      }
    });

    socket.on("stopTyping", (targetChatId) => {
      if (chatId === targetChatId) {
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [chatId, socket]);

  return (
    <>
      {
        fetchSelectedChatLoad || fetchMessagesLoad ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)

          : selectedChat?._id ?
            (<div className={style.selected_chat}>
              <div className={style.header}>
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  title="go back"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <>
                  {
                    selectedChat.isGroupChat ?
                      (<div className={style.groupInfo_info}>
                        <img
                          src={groupImage}
                          alt=""
                        />
                        <span>
                          {selectedChat.groupName}
                        </span>
                        <div className={style.typing}>
                          {typing ? <BeatLoader color="#888" size={8} /> : ""}
                        </div>
                      </div>)
                      : (<Link
                        to={`/users/${anotherChatUser?._id}`}
                        className={style.user_info}
                      >
                        <img
                          src={anotherChatUser?.avatar}
                          alt=""
                        />
                        <span>
                          {anotherChatUser?.name}
                        </span>
                        <div className={style.typing}>
                          {typing ? <BeatLoader color="#888" size={8} /> : ""}
                        </div>
                      </Link>)
                  }
                </>

                <button
                  type="button"
                  onClick={() => setOpenChatInfo(true)}
                  title="chat info"
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                </button>
              </div>

              <div className={style.chat_messages_viewer}>
                {
                  messages.length === 0 ?
                    (<div className={style.no_messages}>
                      No messages have been sent yet
                    </div>)
                    : messages.map((message, index) => (
                      <MessageCard
                        key={message._id}
                        selectedChat={selectedChat}
                        message={message}
                        index={index}
                        messages={messages}
                        setMessages={setMessages}
                        socket={socket}
                      />
                    ))
                }
              </div>

              {/* SendMessageController Component */}
              <>
                <SendMessageController
                  messages={messages}
                  setMessages={setMessages}
                  socket={socket}
                />
              </>

              {/* ChatInformation Component */}
              <>
                {
                  openChatInfo ?
                    (<ChatInformation
                      selectedChat={selectedChat}
                      chats={chats}
                      setChats={setChats}
                      setOpenChatInfo={setOpenChatInfo}
                      setOpenUpdateGroup={setOpenUpdateGroup}
                    />) : ("")
                }
              </>

              {/* UpdateGroup Component */}
              <>
                {
                  openUpdateGroup ?
                    (<UpdateGroup
                      selectedChat={selectedChat}
                      setSelectedChat={setSelectedChat}
                      chats={chats}
                      setChats={setChats}
                      setOpenChatInfo={setOpenChatInfo}
                      setOpenUpdateGroup={setOpenUpdateGroup}
                    />) : ("")
                }
              </>
            </div>)

            : (<div className={style.no_chats_msg}>
              Select chat to start sending messages
            </div>)
      }
    </>
  )
}

export default SelectedChat