import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import PostsViewer from "../PostsViewer/PostsViewer";
import style from "./LikedPosts.module.css";

const LikedPosts = () => {
  const user = useSelector(state => state.user);

  const likedPostsLimit = 10;
  const [likedPostsPage, setLikedPostsPage] = useState(1);

  const [likedPosts, setLikedPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const removePostType = "unlike";

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user?._id}/likedPosts?page=${likedPostsPage}&limit=${likedPostsLimit}`
        );
        setLikedPosts((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedPostsPage]);

  return (
    <div className={`${style.liked_posts}`}>
      <PostsViewer
        posts={likedPosts}
        setPosts={setLikedPosts}
        limit={likedPostsLimit}
        page={likedPostsPage}
        setPage={setLikedPostsPage}
        fetchPostsLoad={fetchPostsLoad}
        setFetchPostsLoad={setFetchPostsLoad}
        removePostType={removePostType}
      />
    </div>
  )
}


export default LikedPosts
