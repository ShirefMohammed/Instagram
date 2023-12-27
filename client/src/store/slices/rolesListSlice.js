import { createSlice } from '@reduxjs/toolkit';

const rolesListSlice = createSlice({
  name: 'rolesListSlice',
  initialState: {
    User: 2001,
    Editor: 1984,
    Admin: 5150
  },
  reducers: {},
});

export default rolesListSlice.reducer;