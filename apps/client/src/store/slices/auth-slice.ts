import { createSlice, type AnyAction, type PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

import type { AuthSession } from "@inventra/types";

import { authApi } from "../api/auth-api";

interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  session: null,
  hydrated: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      state.session = action.payload;
    },
    clearSession(state) {
      state.session = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state, action: AnyAction) => {
        if (action.key === "auth") {
          state.hydrated = true;
        }
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.session = action.payload;
        state.hydrated = true;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.session = action.payload;
        state.hydrated = true;
      });
  }
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
