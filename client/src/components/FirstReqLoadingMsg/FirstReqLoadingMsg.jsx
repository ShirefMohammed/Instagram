import { useEffect, useState } from "react";
import axios from "axios";
import style from "./FirstReqLoadingMsg.module.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const FirstReqLoadingMsg = () => {
  const [responseTime, setResponseTime] = useState(0);
  const [openMessage, setOpenMessage] = useState(false);

  useEffect(() => {
    let intervalId;

    const sendReq = async () => {
      try {
        await axios.get(SERVER_URL);
      } catch (err) {
        console.error(err);
      } finally {
        setOpenMessage(false);
        clearInterval(intervalId);
      }
    };

    intervalId = setInterval(() => {
      setResponseTime((prev) => prev + 1);
    }, 1000);

    sendReq();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (responseTime > 5) {
      setOpenMessage(true);
    }
  }, [responseTime]);

  return (
    <>
      {openMessage && (
        <div className={style.first_req_loading_msg}>
          <p>Please wait from 45 to 60 seconds until server response</p>
          <p>{responseTime} seconds</p>
          <p>
            Info: This delay happens on the first response because the app is
            deployed on a free host on Render.
          </p>
        </div>
      )}
    </>
  );
};

export default FirstReqLoadingMsg;
