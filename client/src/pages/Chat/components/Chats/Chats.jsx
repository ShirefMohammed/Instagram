/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import ChatCard from "../ChatCard/ChatCard";
import CreateChat from "../CreateChat/CreateChat";
import CreateGroupChat from "../CreateGroupChat/CreateGroupChat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import style from "./Chats.module.css";

const Chats = ({ chats, setChats, socket }) => {
  const user = useSelector(state => state.user);

  const [fetchChatsLoad, setFetchChatsLoad] = useState(false);

  const [openCreateChat, setOpenCreateChat] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setFetchChatsLoad(true);
        const res = await axiosPrivate.get(`/chats`);
        setChats(res.data.data);
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
        setFetchChatsLoad(false);
      }
    }
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.chats}>
      {/* Header */}
      <div className={style.header}>
        {/* Go Home */}
        <button
          type="button"
          onClick={() => navigate("/")}
          title="home"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* user info */}
        <Link
          to={`/users/${user?._id}`}
          className={style.user_info}
        >
          <img
            src={user?.avatar}
            alt="avatar"
          />
          <span>{user?.name}</span>
        </Link>

        {/* Create chat */}
        <button
          type="button"
          onClick={() => setOpenCreateChat(true)}
          title="create"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>

      {/* Chats list */}
      <div className={style.chats_list}>
        <h2>Chats</h2>
        {
          fetchChatsLoad ?
            (<div className={style.spinner_container}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : chats.length > 0 ?
              chats.map((chat) => (
                <ChatCard
                  key={chat._id}
                  chat={chat}
                  socket={socket}
                />
              ))

              : chats.length === 0 ?
                (<div className={style.no_chats_msg}>
                  No chats have been created yet
                </div>)

                : ("")
        }
      </div>

      {/* Create chat */}
      <>
        {
          openCreateChat ?
            (<CreateChat
              chats={chats}
              setChats={setChats}
              setOpenCreateChat={setOpenCreateChat}
              setOpenCreateGroup={setOpenCreateGroup}
            />) : ("")
        }
      </>

      {/* Create group chat */}
      <>
        {
          openCreateGroup ?
            (<CreateGroupChat
              chats={chats}
              setChats={setChats}
              setOpenCreateChat={setOpenCreateChat}
              setOpenCreateGroup={setOpenCreateGroup}
            />) : ("")
        }
      </>
    </div>
  )
}

export default Chats
