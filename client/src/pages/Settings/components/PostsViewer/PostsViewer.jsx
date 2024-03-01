/* eslint-disable react/prop-types */
import { MoonLoader, PuffLoader } from "react-spinners";
import PostCard from "../PostCard/PostCard";
import style from "./PostsViewer.module.css";

const PostsViewer = ({ posts, setPosts, limit, page, setPage, fetchPostsLoad, setFetchPostsLoad, removePostType }) => {
  return (
    <div className={`${style.posts_viewer}`}>
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
                      removePostType={removePostType}
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

            : fetchPostsLoad || page * limit === posts.length ?
              (<button
                type="button"
                className={style.load_more_posts_btn}
                disabled={fetchPostsLoad ? true : false}
                style={fetchPostsLoad ? { cursor: "revert" } : {}}
                onClick={() => {
                  setFetchPostsLoad(true)
                  setPage(prev => prev + 1)
                }}
              >
                {
                  fetchPostsLoad ?
                    <PuffLoader color="#000" size={15} />
                    : "More"
                }
              </button>)

              : page * limit > posts.length ?
                (<p className={style.no_more_posts_message}>
                  This section has {posts.length} posts
                </p>)

                : ("")
        }
      </>
    </div>
  )
}

export default PostsViewer
