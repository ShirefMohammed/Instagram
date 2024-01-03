import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAxiosPrivate } from "../hooks";
import { setUser } from "../store/slices/userSlice";
import PostCard from "./PostCard/PostCard";

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
      padding: "30px 15px",
      width: "100%",
      minHeight: "100%"
    }}>
      {
        posts?.length ?
          <div style={{ width:"fit-content", margin: "auto" }}>
            {
              posts.map(post =>
                <div key={post._id}>
                  <PostCard post={post} />
                  <br />
                </div>
              )
            }
          </div>
          : ""
      }
    </section>
  )
}

export default ExploredPosts
