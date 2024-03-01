/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import style from "./MessageCard.module.css";

const MessageCard = ({ selectedChat, message, index, messages, setMessages, socket }) => {
  const user = useSelector(state => state.user);

  const messageRef = useRef(null);

  const [openMsgInfo, setOpenMsgInfo] = useState(false);
  const [deleteMsgLoad, setDeleteMsgLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // check if the same sender of messages to display its photo
  const isSameSender = (index) => {
    let messagesLength = messages.length;

    if (
      (index < messagesLength - 1)
      && (
        messages[index + 1].sender._id != messages[index].sender._id
        || messages[index + 1].sender._id == undefined
      )
      && (messages[index].sender._id != user._id)
    ) {
      return true
    }

    if (
      (index === messagesLength - 1)
      && (messages[messagesLength - 1].sender._id != user._id)
      && (messages[messagesLength - 1].sender._id)
    ) {
      return true;
    }

    return false;
  };

  // check if messages in the same day to display date
  const isSameDay = (index) => {
    if (index === 0) { return true; }

    if (
      messages[index].createdAt.substring(0, 10)
      !== messages[index - 1].createdAt.substring(0, 10)
    ) {
      return true
    }

    return false;
  };

  // scroll to the last message
  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const deleteMessage = async () => {
    try {
      setDeleteMsgLoad(true);

      await axiosPrivate.delete(
        `chats/${message.chat}/messages/${message._id}`
      );

      setMessages(messages.filter((_, i) => i !== index));

      notify("success", "Message is deleted");

      socket.emit("deleteMessage", message);
    }

    catch (err) {
      if (!err?.response) notify("error", 'No Server Response');
      const message = err.response?.data?.message;
      message ? notify("error", message) : notify("error", "Message is not deleted");
    }

    finally {
      setDeleteMsgLoad(false);
    }
  }

  return (
    <div
      className={style.message_card}
      ref={messageRef}
    >
      {/* Day date */}
      <>
        {
          isSameDay(index) ?
            (<div className={style.day_date}>
              {
                `${new Date(message.createdAt).getDate()} 
                  ${new Date(message.createdAt).toLocaleString('default', { month: 'long' })} 
                  ${new Date(message.createdAt).getFullYear()}`
              }
            </div>)
            : ("")
        }
      </>

      {/* Message */}
      <div className={`${style.message} ${message.sender._id == user._id ? style.right : style.left}`}>
        {/* Avatar link */}
        <>
          {
            isSameSender(index) ?
              (<Link to={`/users/${message.sender._id}`} >
                <img
                  src={message.sender.avatar}
                  alt="avatar"
                  className={style.sender_avatar}
                />
              </Link>)
              : message.sender._id != user._id ?
                (<span style={{ margin: "15px" }}></span>)
                : ("")
          }
        </>

        {/* Content */}
        <div className={`${style.content} ${message.sender._id === user._id ? style.right : style.left}`}>
          <pre>
            {message.content}
          </pre>
        </div>

        {/* Message Info */}
        <>
          {
            (
              message?.sender?._id === user._id
              || selectedChat.groupAdmin === user._id
            )
              ?
              (<div className={style.message_info}>
                {/* Toggle btn */}
                <button
                  type="button"
                  className={style.toggle_btn}
                  onClick={() => setOpenMsgInfo(prev => !prev)}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
                {/* Options list */}
                <>
                  {
                    openMsgInfo ?
                      (<ul className={`${style.list} ${style.fade_up}`}>
                        {/* Message date */}
                        <li className={style.msg_date}>
                          <span>
                            {
                              new Date(message.createdAt)
                                .toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })
                            }
                          </span>
                        </li>
                        {/* Delete Btn */}
                        <>
                          {
                            (
                              message?.sender?._id === user._id
                              || selectedChat.groupAdmin === user._id
                            ) ?
                              (<li>
                                <button
                                  type="button"
                                  disabled={deleteMsgLoad ? true : false}
                                  style={deleteMsgLoad ? { cursor: "revert" } : {}}
                                  onClick={deleteMessage}
                                >
                                  <span>Delete Message</span>
                                  {deleteMsgLoad && <PuffLoader color="#000" size={15} />}
                                </button>
                              </li>)
                              : ("")
                          }
                        </>
                      </ul>)
                      : ("")
                  }
                </>
              </div>)
              : ("")
          }
        </>
      </div>
    </div>
  )
}

export default MessageCard