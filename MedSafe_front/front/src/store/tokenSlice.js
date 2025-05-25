import { createSlice } from "@reduxjs/toolkit";

const tokenSlice = createSlice({
  name: "token",
  initialState: {
    token: null,
    roles: [],
  },
  reducers: {
    saveToken(state, action) {
      state.token = action.payload.token;
      state.roles = action.payload.roles || [];
    },
    clearToken(state) {
      state.token = null;
      state.roles = [];
    },
  },
});

export const { saveToken, clearToken } = tokenSlice.actions;
export default tokenSlice.reducer;