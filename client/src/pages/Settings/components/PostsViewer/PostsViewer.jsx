/* eslint-disable react/prop-types */
import { MoonLoader, PuffLoader } from "react-spinners";
import PostCard from "../PostCard/PostCard";
import style from "./PostsViewer.module.css";

const PostsViewer = (
  {
    posts,
    setPosts,
    limit,
    page,
    setPage,
    fetchPostsLoad,
    setFetchPostsLoad,
    removePostType
  }
) => {
  return (
    <div className={`${style.posts_viewer}`}>
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

      {/* Load more posts btn section */}
      <>
        {
          fetchPostsLoad && posts.length === 0 ? ("")

            // While fetching posts || If there are posts in db
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

              // If user reaches last post
              : page * limit > posts.length ?
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

export default PostsViewer
