import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAxiosPrivate } from "../hooks";
import { setUser } from "../store/slices/userSlice";

const ExploredPosts = () => {
  const [posts, setPosts] = useState();
  const user = useSelector(state => state.user);
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await axiosPrivate.get('/posts/explore');
        setPosts(response.data.data);
      } catch (err) {
        console.error(err);
        // if access and refresh token are expired
        if (err.response?.status === 403) {
          dispatch(setUser({ persist: user?.persist }));
          navigate(
            '/authentication',
            {
              state: { from: location },
              replace: true
            }
          );
        }
      }
    };
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{
      padding: "40px"
    }}>
      <h2>Posts</h2>
      {
        posts?.length ?
          <ul>
            {
              posts.map(post => {
                return <li key={post._id}>
                  <p>creator: {post.creator.name}</p>
                  <p>title: {post.title}</p>
                  <p>content: {post.content}</p>
                  {
                    post?.images && post.images.length > 0 ?
                      post.images.map((imageUrl, i) => {
                        return <img
                          key={i}
                          src={imageUrl}
                          alt="post image"
                          style={{width: "100%"}}
                          loading="lazy"
                        />
                      })
                      : ""
                  }
                </li>
              })
            }
          </ul>
          : <p>No users to display</p>
      }
    </section>
  )
}

export default ExploredPosts
