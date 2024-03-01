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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axiosPrivate.get(
          `/posts?page=${postsPage}&limit=${limit}`
        );
        setPosts(prev => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsPage]);

  return (
    <div className={`${style.posts}`}>
      <>
        {
          fetchPostsLoad && posts.length === 0 ?
            (<div className={style.loading}>
              <MoonLoader color="#000" size={20} />
            </div>)

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

      <>
        {
          fetchPostsLoad && posts.length === 0 ? ("")

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

              : postsPage * limit > posts.length ?
                (<p className={style.no_more_posts_message}>
                  This section has {posts.length} posts
                </p>)

                : ("")
        }
      </>
    </div>
  )
}

export default Posts
