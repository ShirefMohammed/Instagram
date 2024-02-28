import { useEffect, useRef, useState } from 'react';
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNotify, useAxiosPrivate } from '../../hooks';
import uploadImageIcon from "../../assets/uploadImageIcon.svg";
import style from './CreatePost.module.css';

const CreatePost = () => {
  const errRef = useRef(null);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const [createPostLoad, setCreatePostLoad] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  useEffect(() => {
    setErrMsg("");
  }, [content, images]);

  const selectImages = (e) => {
    setImages(Array.from(new Set([...images, ...e.target.files])));
  }

  const removeImage = (target) => {
    setImages(images.filter(image => image !== target));
  }

  const createPost = async (e) => {
    e.preventDefault();

    try {
      if (images.length < 1) {
        return notify("info", "Select one image at least");
      } else if (images.length > 12) {
        return notify("info", "Max available images is 12");
      }

      setCreatePostLoad(true);

      const formData = new FormData();
      formData.append("content", content);

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      const res = await axiosPrivate.post(
        "posts",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      notify("success", res.data.message);

      setContent("");
      setImages([]);
    }

    catch (err) {
      if (!err?.response) setErrMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg('Post is not created');
      errRef.current.focus();
    }

    finally {
      setCreatePostLoad(false);
    }
  }

  return (
    <form
      className={style.create_post}
      encType="multipart/form-data"
      onSubmit={createPost}
    >
      <h2>Create new post</h2>

      <>
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
      </>

      <textarea
        name="content"
        id="content"
        placeholder="Optional description for post"
        required={false}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
      </textarea>

      <div className={style.images_container}>
        <>
          {
            images.length > 0 ?
              (<ul className={style.images_list}>
                {
                  images.map((image, i) => (
                    <li key={i}>
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
                  ))
                }
              </ul>)

              : (<img
                className={style.upload_images_icon}
                src={uploadImageIcon}
                alt="upload images icon"
              />)
          }
        </>

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

      <button
        type='submit'
        disabled={createPostLoad ? true : false}
        style={createPostLoad ? { opacity: .5, cursor: "revert" } : {}}
      >
        <span>Create</span>
        {createPostLoad && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  )
}

export default CreatePost
