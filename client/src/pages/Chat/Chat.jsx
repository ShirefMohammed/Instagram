import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Chats from "./components/Chats/Chats";
import SelectedChat from "./components/SelectedChat/SelectedChat";
import style from "./Chat.module.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const socket = io(SERVER_URL);

const Chat = () => {
  const user = useSelector(state => state.user);

  const { chatId } = useParams(); // selected chat id

  // current user chats
  // which will be fetched in chats component
  // also used in selectedChat component
  // when update or delete the chat from chat info
  const [chats, setChats] = useState([]);

  // Join socket user room
  useEffect(() => {
    socket.emit("setup", user._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.chat_page}>
      <div className={`${style.left_side} ${chatId !== undefined ? style.hide_md : ""}`}>
        <Chats
          chats={chats}
          setChats={setChats}
          socket={socket}
        />
      </div>

      <div className={`${style.right_side} ${chatId === undefined ? style.hide_md : ""}`}>
        <SelectedChat
          chats={chats}
          setChats={setChats}
          socket={socket}
        />
      </div>
    </div>
  )
}

export default Chat