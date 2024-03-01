/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import groupImage from "../../../../assets/groupImage.png";
import style from "./ChatCard.module.css";

const ChatCard = ({ chat, socket }) => {
  const { chatId } = useParams();

  const user = useSelector(state => state.user);

  // for single chat
  const [anotherUser, setAnotherUser] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(false);

  // Emit checkUserConnected socket event in single chat
  useEffect(() => {
    if (!chat.isGroupChat) {
      const anotherUser = chat.users.find(u => u._id !== user._id);
      setAnotherUser(anotherUser);
      socket.emit("checkUserConnected", anotherUser._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // checkUserConnected socket event in single chat
  useEffect(() => {
    socket.on("checkUserConnected", ({ userId, isConnected }) => {
      if (!chat.isGroupChat && isConnected) {
        const anotherUser = chat.users.find(u => u._id !== user._id);
        if (userId === anotherUser._id) {
          setConnectionStatus(true);
        }
      }
    });

    return () => {
      socket.off("checkUserConnected");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Link
      to={`/chat/${chat._id}`}
      className={`${style.chat_card} ${chatId === chat._id ? style.active : ""}`}
    >
      <div className={style.image_container}>
        {
          chat.isGroupChat ?
            (<img src={groupImage} alt="group image" />)
            : (<img src={anotherUser?.avatar} alt="avatar" />)
        }
        {
          connectionStatus ?
            (<div className={style.connection_status}></div>)
            : ("")
        }
      </div>

      <div>
        <span className={style.name}>
          {chat.isGroupChat ? (chat.groupName) : (anotherUser?.name)}
        </span>

        <p className={style.latest_message}>
          {
            chat.latestMessage ?
              (<>
                {chat.latestMessage.sender._id === user._id ? "You: " : ""}
                {
                  chat.latestMessage.content.length > 25 ?
                    (chat.latestMessage.content.substring(0, 25) + "...")
                    : (chat.latestMessage.content)
                }
              </>)
              : ("")
          }
        </p>
      </div>
    </Link>
  )
}

export default ChatCard