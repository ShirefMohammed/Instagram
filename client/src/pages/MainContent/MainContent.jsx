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
  CreatePost,
  UpdatePost,
  CreateReport,
  Report,
  UpdateReport,
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
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={"explore"} />

          {/* Protected Routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            <Route path="/chat" element={"chat"} />
            <Route path="/notifications" element={"notifications"} />
            {/* Posts Routes */}
            <Route path="/createPost" element={<CreatePost />} />
            <Route path="/posts/:id/update" element={<UpdatePost />} />
            <Route path="/profile" element={"profile"} />
            <Route path="/settings" element={"settings"} />
            <Route path="/settings/saved" element={"/settings/saved"} />
            {/* Reports Routes */}
            <Route path="/createReport" element={<CreateReport />} />
            <Route path="/reports/:id" element={<Report />} />
            <Route path="/reports/:id/update" element={<UpdateReport />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<NoTFoundPage />} />
        </Routes>
      </section>
    </div>
  );
};

export default MainContent
