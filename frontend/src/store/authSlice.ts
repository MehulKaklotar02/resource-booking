import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api";
import type { ApiErrorPayload, LoginCredentials, User } from "../api";

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialToken = localStorage.getItem("token");
const initialUserJson = localStorage.getItem("user");

const initialState: AuthState = {
  user: initialUserJson ? JSON.parse(initialUserJson) : null,
  token: initialToken || null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<
  { token: string; user: User },
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await authApi.login(credentials);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (err: unknown) {
    const apiError = err as ApiErrorPayload;
    return rejectWithValue(apiError.message || "Failed to login. Please check your credentials.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
