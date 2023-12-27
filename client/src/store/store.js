import { configureStore } from '@reduxjs/toolkit';
import userSlice from "./slices/userSlice";
import rolesListSlice from "./slices/rolesListSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    roles: rolesListSlice
  },
  // devTools: false
});

export { store };