import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import {
  PersistLogin,
  // RequireAuth,
} from "./components";
import {
  MainContent,
  Authentication,
  Unauthorized,
} from "./pages";

function App() {
  // const ROLES_LIST = useSelector(state => state.roles);
  const user = useSelector(state => state.user);
  console.log(user);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PersistLogin />}>
          {/* Public Routes */}
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/*" element={<MainContent />} />

          {/* Protected Routes */}
          {/* Will Added Later */}
        </Route>
      </Routes>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )
}

export default App
