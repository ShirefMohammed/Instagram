import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// Components
import {
  PersistLogin,
  // RequireAuth,
} from "./components";
// Pages
import {
  MainContent,
  Authentication,
  Unauthorized,
  NoServerResponse,
} from "./pages";

function App() {
  // const ROLES_LIST = useSelector(state => state.roles);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PersistLogin />}>
          {/* Public Routes */}
          <Route path="/*" element={<MainContent />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/noServerResponse" element={<NoServerResponse />} />

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
        style={{ minWidth: "375px" }}
      />
    </BrowserRouter>
  )
}

export default App
