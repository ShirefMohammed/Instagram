import { configureStore } from '@reduxjs/toolkit';
import userSlice from "./slices/userSlice";

const devToolsStatus = import.meta.env.VITE_NODE_ENV === "development" ? true : false;

const store = configureStore({
  reducer: {
    user: userSlice,
  },
  devTools: devToolsStatus
});

export { store };