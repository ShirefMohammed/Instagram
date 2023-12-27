import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotify, useAxiosPrivate } from '../../hooks';
import { MoonLoader } from "react-spinners";
import style from './UpdatePost.module.css';

const CreatePost = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errorFetching, setErrorFetching] = useState("");
  const notify = useNotify();
  const axiosPrivate = useAxiosPrivate();

  // Fetching post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoadingData(true);
        const res = await axiosPrivate.get(`posts/${id}`);
        setContent(res?.data?.data?.content);
        setImages(res?.data?.data?.images);
      }

      catch (err) {
        console.log(err)
        setErrorFetching("This page is not available now, try refresh page or wait for while");
      }

      finally {
        setLoadingData(false);
      }
    }
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update post
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoadingUpdate(true);

      const response = await axiosPrivate.patch(
        `posts/${id}`,
        { content: content },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      const message = response?.data?.message;
      notify("success", message);
    }

    catch (err) {
      console.log(err);
      if (!err?.response) {
        notify("error", "NO Server Response");
      } else {
        const message = err.response?.data?.message;
        message ?
          notify("error", message)
          : notify("error", "Post not updated");
      }
    }

    finally {
      setLoadingUpdate(false);
    }
  }

  return (
    <>
      {
        // If fetching post data still loading
        loadingData ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={25} />
          </div>)

          // If error happened while fetching data
          : errorFetching ?
            (<div className={style.error_fetching_data}>
              {errorFetching}
            </div>)

            // If all thing ready
            : (<form
              className={style.update_post}
              onSubmit={handleSubmit}
            >
              {/* Page Title */}
              <h2>Update post</h2>

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

              {/* Post Images */}
              <div className={style.images_container}>
                <ul className={style.images}>
                  {
                    images.map((image) =>
                    (<li key={image}>
                      <img src={image} alt="image" />
                    </li>)
                    )
                  }
                </ul>
              </div>

              {/* Submit btn */}
              <button
                type='submit'
                disabled={loadingUpdate ? true : false}
              >
                <span>Update</span>
                {loadingUpdate && <MoonLoader color="#fff" size={15} />}
              </button>
            </form>)
      }
    </>
  )
}

export default CreatePost
