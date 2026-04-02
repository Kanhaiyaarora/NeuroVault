import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.status = "loading";
      state.error = null;
    },
    loginSuccess(state, action) {
      state.status = "succeeded";
      state.user = action.payload;
      state.error = null;
    },
    loginFail(state, action) {
      state.status = "failed";
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFail, logout } =
  authSlice.actions;
export default authSlice.reducer;
