import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, signupApi } from "./services/auth.api.js";

// Async thunks - API calls happen here
export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginApi(email, password);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Login failed");
    }
  },
);

export const signupAsync = createAsyncThunk(
  "auth/signupAsync",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const data = await signupApi(username, email, password);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Signup failed");
    }
  },
);

const initialState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login async thunk handlers
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Signup async thunk handlers
      .addCase(signupAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
