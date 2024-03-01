/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import style from "./SendMessageController.module.css";

const SendMessageController = ({ messages, setMessages, socket }) => {
  const { chatId } = useParams();

  const [newMessage, setNewMessage] = useState("");
  const [sendMessageLoad, setSendMessageLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [clickOutPickerEvent, setClickOutPickerEvent] = useState(false);

  // Handle click event outside picker
  useEffect(() => {
    if (openEmojiPicker == true) {
      setClickOutPickerEvent(true);
    } else {
      setClickOutPickerEvent(false);
    }
  }, [openEmojiPicker]);

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      setSendMessageLoad(true);

      if (!newMessage) return notify("info", "Enter message content");

      const res = await axiosPrivate.post(
        `chats/${chatId}/messages`,
        { content: newMessage }
      );

      setMessages([...messages, res.data.data]);

      socket.emit("sendMessage", res.data.data);

      setNewMessage("");
    } catch (err) {
      handleErrors(err);
    } finally {
      setSendMessageLoad(false);
    }
  }

  return (
    <form className={style.send_message}>
      <textarea
        name="message"
        id="message"
        placeholder="Send new message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={() => socket.emit("typing", chatId)}
        onKeyUp={() => socket.emit("stopTyping", chatId)}
      >
      </textarea>

      <div className={style.emoji}>
        <button
          type="button"
          onClick={() => setOpenEmojiPicker(prev => !prev)}
        >
          <FontAwesomeIcon icon={faFaceSmile} />
        </button>

        {
          openEmojiPicker &&
          (<div className={style.emoji_container}>
            <Picker
              data={data}
              theme="light"
              onEmojiSelect={(e) => setNewMessage(prev => prev + e.native)}
              onClickOutside={() => {
                if (clickOutPickerEvent === true) {
                  setOpenEmojiPicker(false)
                }
              }}
            />
          </div>)
        }
      </div>

      <button
        type="submit"
        className={style.submit_btn}
        disabled={sendMessageLoad ? true : false}
        style={sendMessageLoad ? { cursor: "revert" } : {}}
        onClick={sendMessage}
      >
        {
          sendMessageLoad ?
            <PuffLoader color="#000" size={22} />
            : <FontAwesomeIcon icon={faPaperPlane} />
        }
      </button>
    </form>
  )
}

export default SendMessageController