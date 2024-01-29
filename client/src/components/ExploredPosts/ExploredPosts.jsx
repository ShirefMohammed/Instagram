// Modules
import { useState, useEffect } from "react";
import { MoonLoader, PuffLoader } from "react-spinners";
// Component
import { PostCard } from "../";
// Hooks
import { useHandleErrors } from "../../hooks";
// Axios
import axios from "../../api/axios";
// Css style
import style from "./ExploredPosts.module.css"

const ExploredPosts = () => {
  const limit = 10;
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [postsIds, setPostsIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleErrors = useHandleErrors();

  // Fetch explored Posts
  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/posts/explore?page=${page}&limit=${limit}&exceptedPosts=${postsIds.join(',')}`
        );
        setPosts([...posts, ...res.data.data]);
        setPostsIds([
          ...postsIds,
          ...res.data.data.map(post => post?._id)
        ]);
      } catch (err) {
        handleErrors.handleNoServerResponse(err);
        handleErrors.handleServerError(err);
      } finally {
        setLoading(false);
      }
    }
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className={style.explored_posts}>
      {
        loading && posts?.length === 0 ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)

          : posts?.length ?
            (<div className={style.posts_container}>
              {/* Posts */}
              <>
                {
                  posts.length > 0 ?
                    posts.map(post => {
                      return <PostCard key={post._id} post={post} />
                    })
                    : ""
                }
              </>

              {/* Loading More Posts Button */}
              <>
                {
                  // While fetching posts || If there are posts in db
                  loading || page * limit === posts.length ?
                    (<button
                      type="button"
                      className={style.load_more_posts_btn}
                      disabled={loading ? true : false}
                      onClick={() => {
                        setLoading(true)
                        setPage(prev => prev + 1)
                      }}
                    >
                      {
                        loading ?
                          <PuffLoader color="#000" size={25} />
                          : "More"
                      }
                    </button>)

                    // If user reaches last post
                    : page * limit > posts.length ?
                      (<p className={style.no_more_posts_message}>
                        You reached last post
                      </p>)

                      // No thing
                      : ""
                }
              </>
            </div>) : ""
      }
    </div>
  )
}

export default ExploredPosts
