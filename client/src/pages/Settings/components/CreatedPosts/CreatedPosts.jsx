import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHandleErrors } from "../../../../hooks";
import PostsViewer from "../PostsViewer/PostsViewer";
import style from "./CreatedPosts.module.css";
import axios from "../../../../api/axios";

const CreatedPosts = () => {
  const user = useSelector(state => state.user);

  const createdPostsLimit = 10;
  const [createdPostsPage, setCreatedPostsPage] = useState(1);

  const [createdPosts, setCreatedPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const removePostType = "deletePost";
  const handleErrors = useHandleErrors();

  // Fetch created posts
  useEffect(() => {
    const createdPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axios.get(
          `/users/${user?._id}/createdPosts?page=${createdPostsPage}&limit=${createdPostsLimit}`
        );
        setCreatedPosts(prev => [...prev, ...res.data.data]);
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
        setFetchPostsLoad(false);
      }
    }
    createdPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdPostsPage]);

  return (
    <div className={`${style.created_posts}`}>
      {/* Posts cards */}
      <PostsViewer
        posts={createdPosts}
        setPosts={setCreatedPosts}
        limit={createdPostsLimit}
        page={createdPostsPage}
        setPage={setCreatedPostsPage}
        fetchPostsLoad={fetchPostsLoad}
        setFetchPostsLoad={setFetchPostsLoad}
        removePostType={removePostType}
      />
    </div>
  )
}

export default CreatedPosts
