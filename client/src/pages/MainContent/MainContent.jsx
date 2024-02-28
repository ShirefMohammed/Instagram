import { Route, Routes } from 'react-router-dom';
import Sidebar from "./components/Sidebar/Sidebar";
import { RequireAuth } from '../../components';
import {
  Home,
  Search,
  Explore,
  Post,
  Profile,
  CreateReport,
  Report,
  UpdateReport,
  CreatePost,
  UpdatePost,
  UpdateProfile,
  Settings,
  Notifications,
  AdminDashboard,
  NoTFoundPage,
} from '../';
import ROLES_LIST from "../../utils/roles_list";
import style from "./MainContent.module.css";

const MainContent = () => {
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
          <Route path="/posts/:id" element={<Post />} />
          <Route path="/users/:id" element={<Profile />} />

          {/* Protected Routes only verified user can access them */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            {/* Reports Routes */}
            <Route path="/createReport" element={<CreateReport />} />
            <Route path="/reports/:id" element={<Report />} />
            <Route path="/reports/:id/update" element={<UpdateReport />} />

            {/* Posts Routes */}
            <Route path="/createPost" element={<CreatePost />} />
            <Route path="/posts/:id/update" element={<UpdatePost />} />

            {/* Profile Routes */}
            <Route path="/users/:id/update" element={<UpdateProfile />} />

            {/* Settings Routes */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/:tab" element={<Settings />} />

            {/* Notifications Routes */}
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Protected Routes only admins can access them */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.Admin]} />}>
            <Route path="/adminDashboard" element={<AdminDashboard />} />
            <Route path="/adminDashboard/:tab" element={<AdminDashboard />} />
          </Route>

          {/* Catch all page not found */}
          <Route path="*" element={<NoTFoundPage />} />
        </Routes>
      </section>
    </div>
  );
};

export default MainContent
