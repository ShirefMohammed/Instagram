import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
// Components
import {
  Sidebar,
  RequireAuth,
} from '../../components';
// Pages
import {
  Home,
  CreatePost,
  UpdatePost,
  NoTFoundPage,
} from '../';
// Style
import style from "./MainContent.module.css";

const MainContent = () => {
  const ROLES_LIST = useSelector((state) => state.roles);

  return (
    <div className={style.main_content}>
      <section>
        <Sidebar />
      </section>

      <section className={style.current_page}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={"search"} />
          <Route path="/explore" element={"explore"} />

          {/* Protected Routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            <Route path="/chat" element={"chat"} />
            <Route path="/notifications" element={"notifications"} />
            <Route path="/createPost" element={<CreatePost />} />
            <Route path="/posts/:id/update" element={<UpdatePost />} />
            <Route path="/profile" element={"profile"} />
            <Route path="/settings" element={"settings"} />
            <Route path="/settings/saved" element={"/settings/saved"} />
            <Route path="/createReport" element={"createReport"} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<NoTFoundPage />} />
        </Routes>
      </section>
    </div>
  );
};

export default MainContent
