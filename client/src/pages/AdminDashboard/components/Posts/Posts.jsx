import { useEffect, useState } from "react";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import PostCard from "../PostCard/PostCard";
import style from "./Posts.module.css";

const Posts = () => {
  const limit = 10;
  const [postsPage, setPostsPage] = useState(1);

  const [posts, setPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axiosPrivate.get(
          `/posts?page=${postsPage}&limit=${limit}`
        );
        setPosts(prev => [...prev, ...res.data.data]);
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
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsPage]);

  return (
    <div className={`${style.posts}`}>
      {/* Posts viewer section */}
      <>
        {
          // While fetching posts and posts length is 0
          fetchPostsLoad && posts.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

            // If post have been fetched
            : posts.length > 0 ?
              (<div className={style.viewer}>
                {
                  posts.map((post) => (
                    <PostCard
                      key={post?._id}
                      post={post}
                      posts={posts}
                      setPosts={setPosts}
                    />
                  ))
                }
              </div>)

              : ("")
        }
      </>

      {/* Load more posts btn section */}
      <>
        {
          fetchPostsLoad && posts.length === 0 ? ("")

            // While fetching posts || If there are posts in db
            : fetchPostsLoad || postsPage * limit === posts.length ?
              (<button
                type="button"
                className={style.load_more_posts_btn}
                disabled={fetchPostsLoad ? true : false}
                style={fetchPostsLoad ? { cursor: "revert" } : {}}
                onClick={() => {
                  setFetchPostsLoad(true)
                  setPostsPage(prev => prev + 1)
                }}
              >
                {
                  fetchPostsLoad ?
                    <PuffLoader color="#000" size={15} />
                    : "More"
                }
              </button>)

              // If user reaches last post
              : postsPage * limit > posts.length ?
                (<p className={style.no_more_posts_message}>
                  This section has {posts.length} post
                </p>)

                // No thing
                : ("")
        }
      </>
    </div>
  )
}

export default Posts
