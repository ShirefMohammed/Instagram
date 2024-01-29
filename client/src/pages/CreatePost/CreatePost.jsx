// Modules
import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
// Hooks
import { useNotify, useAxiosPrivate } from '../../hooks';
// Images
import uploadImageIcon from "../../assets/uploadImageIcon.svg";
// Css style
import style from './CreatePost.module.css';

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const errRef = useRef();
  const notify = useNotify();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setErrMsg("");
  }, [content, images]);

  const selectImages = (e) => {
    setImages(Array.from(new Set([...images, ...e.target.files])));
  }

  const removeImage = (e) => {
    setImages(images.filter(image => image !== e));
  }

  // Create post
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (images.length === 0) {
        return notify("info", "Select one image at least");
      } else if (images.length > 12) {
        return notify("info", "Max images is 12");
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("content", content);
      // Append each file individually
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      const response = await axiosPrivate.post(
        "posts",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      const message = response?.data?.message;
      notify("success", message);

      setContent("");
      setImages([]);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Post not created');
      errRef.current.focus();
    }

    finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={style.create_post}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      {/* Page Title */}
      <h2>Create new post</h2>

      {/* Error Message */}
      {
        errMsg &&
        <p
          ref={errRef}
          className={style.error_message}
          aria-live="assertive"
        >
          {errMsg}
        </p>
      }

      {/* Content */}
      <textarea
        name="content"
        id="content"
        placeholder="Description for post *optional"
        required={false}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
      </textarea>

      {/* Select Images */}
      <div className={style.images_container}>
        {
          images.length === 0 ?
            (<img
              className={style.upload_images_icon}
              src={uploadImageIcon}
              alt="upload images icon"
            />)
            : (<ul className={style.images}>
              {
                images.map((image, i) => {
                  return <li key={i}>
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image?.name}
                    />
                  </li>
                })
              }
            </ul>)
        }

        <input
          type="file"
          id="upload_images_input"
          accept=".jpeg, .jpg, .png, .jfif"
          multiple={true}
          onChange={selectImages}
        />

        <label htmlFor="upload_images_input">
          upload images from your machine
        </label>
      </div>

      {/* Submit btn */}
      <button
        type='submit'
        disabled={loading ? true : false}
        style={loading ? { opacity: .5, cursor: "revert" } : {}}
      >
        <span>Create</span>
        {loading && <MoonLoader color="#fff" size={15} />}
      </button>
    </form>
  )
}

export default CreatePost
