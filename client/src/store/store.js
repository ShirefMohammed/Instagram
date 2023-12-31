import { configureStore } from '@reduxjs/toolkit';
import userSlice from "./slices/userSlice";
import rolesListSlice from "./slices/rolesListSlice";

const devToolsStatus = import.meta.env.VITE_NODE_ENV === "development" ? false : true;

const store = configureStore({
  reducer: {
    user: userSlice,
    roles: rolesListSlice
  },
  devTools: devToolsStatus
});

export { store };