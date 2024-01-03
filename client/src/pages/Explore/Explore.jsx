// Components
import {
  ExploredPosts
} from "../../components";
// Css style
import style from "./Explore.module.css";

// Main Component - Explore
const Explore = () => {
  return (
    <div className={style.explore}>
      <ExploredPosts />
    </div>
  )
}

export default Explore
