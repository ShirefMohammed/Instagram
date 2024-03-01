import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import PostsViewer from "../PostsViewer/PostsViewer";
import style from "./SavedPosts.module.css";

const SavedPosts = () => {
  const user = useSelector(state => state.user);

  const savedPostsLimit = 10;
  const [savedPostsPage, setSavedPostsPage] = useState(1);

  const [savedPosts, setSavedPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const removePostType = "unsave";

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/savedPosts?page=${savedPostsPage}&limit=${savedPostsLimit}`
        );
        setSavedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPostsPage]);

  return (
    <div className={`${style.saved_posts}`}>
      <PostsViewer
        posts={savedPosts}
        setPosts={setSavedPosts}
        limit={savedPostsLimit}
        page={savedPostsPage}
        setPage={setSavedPostsPage}
        fetchPostsLoad={fetchPostsLoad}
        setFetchPostsLoad={setFetchPostsLoad}
        removePostType={removePostType}
      />
    </div>
  )
}

export default SavedPosts