import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  PersistLogin,
  RequireAuth,
  ToastContainerWithProps,
} from "./components";
import {
  MainContent,
  Authentication,
  Unauthorized,
  NoServerResponse,
  ServerError,
  NoResourceFound,
  Chat,
} from "./pages";
import ROLES_LIST from "./utils/roles_list";

function App() {
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

          {/* Private Routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:chatId" element={<Chat />} />
          </Route>
        </Route>
      </Routes>

      {/* Toast Container with its props */}
      <ToastContainerWithProps />
    </BrowserRouter>
  )
}

export default App
