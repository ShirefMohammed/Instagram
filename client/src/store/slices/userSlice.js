import { createSlice } from '@reduxjs/toolkit';

let persist = localStorage.getItem("persist") === "true" ? true : false;

const userSlice = createSlice({
  name: 'userSlice',
  initialState: {
    persist: persist
  },
  reducers: {
    setUser: (state, action) => {
      return action.payload;
    }
  }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;