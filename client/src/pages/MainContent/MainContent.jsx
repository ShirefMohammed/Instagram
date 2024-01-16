// Modules
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
  Search,
  Explore,
  CreatePost,
  UpdatePost,
  CreateReport,
  Report,
  UpdateReport,
  NoTFoundPage,
} from '../';
// Css style
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
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />

          {/* Protected Routes only user can access them */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            {/* Reports Routes */}
            <Route path="/createReport" element={<CreateReport />} />
            <Route path="/reports/:id" element={<Report />} />
            <Route path="/reports/:id/update" element={<UpdateReport />} />

            {/* Posts Routes */}
            <Route path="/createPost" element={<CreatePost />} />
            <Route path="/posts/:id/update" element={<UpdatePost />} />

            {/* Profile Routes */}
            <Route path="/profile" element={"profile"} />

            {/* Settings Routes */}
            <Route path="/settings" element={"settings"} />
            <Route path="/settings/saved" element={"/settings/saved"} />

            {/* Chat Routes */}
            <Route path="/chat" element={"chat"} />

            {/* Notifications Routes */}
            <Route path="/notifications" element={"notifications"} />
          </Route>

          {/* Catch all page not found */}
          <Route path="*" element={<NoTFoundPage />} />
        </Routes>
      </section>
    </div>
  );
};

export default MainContent
