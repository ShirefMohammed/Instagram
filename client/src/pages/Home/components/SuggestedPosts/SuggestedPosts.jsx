import { useState, useEffect } from "react";
import { MoonLoader, PuffLoader } from "react-spinners";
import { useHandleErrors } from "../../../../hooks";
import { PostCard } from "../../../../components";
import axios from "../../../../api/axios";
import style from "./SuggestedPosts.module.css"

const SuggestedPosts = () => {
  const limit = 10;
  const [page, setPage] = useState(1);

  const [posts, setPosts] = useState([]);
  const [fetchPostsLoad, setFetchPostsLoad] = useState(false);

  const handleErrors = useHandleErrors();

  useEffect(() => {
    const getPosts = async () => {
      try {
        setFetchPostsLoad(true);
        const res = await axios.get(
          `/posts/suggest?page=${page}&limit=${limit}`
        );
        setPosts([...posts, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchPostsLoad(false);
      }
    }
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className={style.suggested_posts}>
      {
        fetchPostsLoad && posts.length === 0 ?
          (<div className={style.loading_container}>
            <MoonLoader color="#000" size={20} />
          </div>)

          : posts?.length > 0 ?
            (<div className={style.posts_container}>
              <>
                {
                  posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))
                }
              </>

              <>
                {
                  fetchPostsLoad || page * limit === posts.length ?
                    (<button
                      type="button"
                      className={style.load_more_posts_btn}
                      disabled={fetchPostsLoad ? true : false}
                      onClick={() => {
                        setFetchPostsLoad(true)
                        setPage(prev => prev + 1)
                      }}
                    >
                      {
                        fetchPostsLoad ?
                          <PuffLoader color="#000" size={25} />
                          : "More"
                      }
                    </button>)

                    : page * limit > posts.length ?
                      (<p className={style.no_more_posts_message}>
                        You reached last post
                      </p>)

                      : ("")
                }
              </>
            </div>)

            : ("")
      }
    </div>
  )
}

export default SuggestedPosts
