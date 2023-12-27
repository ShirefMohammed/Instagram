import { toast } from "react-toastify";

const useNotify = () => {
  const theme = localStorage.getItem("theme");
  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
  };

  const notify = (status, message) => {
    if(status === "success") {
      toast.success(message, toastOptions);
    } else if (status === "info") {
      toast.info(message, toastOptions);
    } else if (status === "error") {
      toast.error(message, toastOptions);
    } else {
      toast(message, toastOptions);
    }
  };

  return notify;
}

export default useNotify
