/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MoonLoader, PuffLoader } from "react-spinners";
import defaultPostImage from "../../../../assets/defaultPostImage.png";
import style from "./PostsViewer.module.css";

const PostsViewer = ({ posts, limit, page, setPage, fetchPostsLoad, setFetchPostsLoad }) => {
  return (
    <div className={style.posts_viewer}>
      <>
        {
          fetchPostsLoad && posts.length === 0 ?
            (<div className={style.loading_container}>
              <MoonLoader color="#000" size={20} />
            </div>)

            : posts?.length && posts.length > 0 ?
              (<div className={style.viewer}>
                {
                  posts.map((post) => (
                    <Link
                      key={post?._id}
                      to={`/posts/${post?._id}`}
                      className={style.post_card}
                    >
                      <img
                        src={post?.images[0] || defaultPostImage}
                        alt=""
                        loading="lazy"
                      />
                    </Link>
                  ))
                }
              </div>)

              : ("")
        }
      </>

      <>
        {
          fetchPostsLoad || page * limit === posts.length ?
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
                This section has {posts.length} post
              </p>)

              : ("")
        }
      </>
    </div>
  )
}

export default PostsViewer
