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
  ServerError,
  NoResourceFound,
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
          {/* Handle Error Routes */}
          <Route path="/serverError" element={<ServerError />} />
          <Route path="/noServerResponse" element={<NoServerResponse />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/noResourceFound" element={<NoResourceFound />} />

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
