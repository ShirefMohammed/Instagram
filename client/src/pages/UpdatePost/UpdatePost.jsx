import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MoonLoader } from "react-spinners";
import { useNotify, useAxiosPrivate, useHandleErrors } from '../../hooks';
import style from './UpdatePost.module.css';

const UpdatePost = () => {
  const { id } = useParams();

  const errRef = useRef(null);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const [fetchPostLoad, setFetchPostLoad] = useState(false);
  const [updatePostLoad, setUpdatePostLoad] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  useEffect(() => setErrorMsg(""), [content]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setFetchPostLoad(true);
        const res = await axiosPrivate.get(`posts/${id}`); // public for all
        setContent(res.data.data.content);
        setImages(res.data.data.images);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchPostLoad(false);
      }
    }
    fetchPostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePost = async (e) => {
    e.preventDefault();

    try {
      setUpdatePostLoad(true);
      const res = await axiosPrivate.patch(
        `posts/${id}`,
        { content: content },
      );
      notify("success", res.data.message);
    }

    catch (err) {
      if (!err?.response) setErrorMsg('No Server Response');
      const message = err.response?.data?.message;
      message ? setErrorMsg(message) : setErrorMsg('Post is not updated');
      errRef.current.focus();
    }

    finally {
      setUpdatePostLoad(false);
    }
  }

  return (
    <>
      {
        !fetchPostLoad ?
          (<form
            className={style.update_post}
            onSubmit={updatePost}
          >
            <h2>Update post</h2>

            <>
              {
                errorMsg &&
                <p
                  ref={errRef}
                  className={style.error_message}
                  aria-live="assertive"
                >
                  {errorMsg}
                </p>
              }
            </>

            <textarea
              name="content"
              id="content"
              placeholder="Optional description for the post"
              required={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            >
            </textarea>

            <ul className={style.images_container}>
              {
                images.map((image) => (
                  <li key={image}>
                    <img src={image} alt="image" />
                  </li>
                ))
              }
            </ul>

            <button
              type='submit'
              disabled={updatePostLoad ? true : false}
              style={updatePostLoad ? { opacity: .5, cursor: "revert" } : {}}
            >
              <span>Save Updates</span>
              {updatePostLoad && <MoonLoader color="#000" size={15} />}
            </button>
          </form>)

          : (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)
      }
    </>
  )
}

export default UpdatePost
