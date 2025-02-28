import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authClient } from "@/helpers/8baseAuth";
import currentUserQuery from "@/graphql/queries/currentUser.query.gql";
import userSignUpMutation from "@/graphql/mutations/userSignUp.mutation.gql";
import { apolloClient } from "@/graphql/apolloClient"; 
import type { User } from "@/types";
import type { RootState } from "./store"; // Import RootState ze store'a

const localStorageKey = "id_token";
const localStorageKeyUserId = "id_user";

const idToken = localStorage.getItem(localStorageKey);
const idUser = localStorage.getItem(localStorageKeyUserId);

interface AuthState {
  authenticated: boolean;
  idToken: string | null;
  user: User | null;
}

const initialState: AuthState = {
  authenticated: !!idToken,
  idToken,
  user: null,
};

// Thunk do inicjalizacji użytkownika
export const initUser = createAsyncThunk<User | null, void, { state: RootState }>(
  "auth/initUser",
  async (_, { getState }) => {
    const state = getState();
    if (!state.auth.idToken || !idUser) return null;

    try {
      const res = await apolloClient.query({
        query: currentUserQuery,
        context: {
          headers: { authorization: `Bearer ${state.auth.idToken}` },
        },
      });
      return res.data.user as User;
    } catch {
      console.log("No existing user matching id token");
      return null;
    }
  }
);

// Thunk do obsługi logowania użytkownika
export const handleAuthentication = createAsyncThunk<
  { user: User; idToken: string } | null,
  void,
  { state: RootState }
>("auth/handleAuthentication", async () => {
  const authResult = authClient.getAuthorizedData();
  let user: User | null = null;

  try {
    const res = await apolloClient.query({
      query: currentUserQuery,
      context: {
        headers: { authorization: `Bearer ${authResult.idToken}` },
      },
    });
    user = res.data.user;
  } catch {
    const res = await apolloClient.mutate({
      mutation: userSignUpMutation,
      variables: {
        user: {
          email: authResult.email,
          firstName: authResult.firstName,
          lastName: authResult.lastName,
          team: {
            create: { name: `${authResult.firstName}'s team` },
          },
        },
        authProfileId: import.meta.env.VITE_AUTH_PROFILE_ID,
      },
      context: {
        headers: { authorization: `Bearer ${authResult.idToken}` },
      },
    });

    user = res.data.user;
  }

  localStorage.setItem(localStorageKey, authResult.idToken);
  if (user?.id) localStorage.setItem(localStorageKeyUserId, user.id);

  return user ? { user, idToken: authResult.idToken } : null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: () => {
      authClient.authorize();
    },
    logout: (state) => {
      authClient.logout();
      state.authenticated = false;
      state.idToken = null;
      state.user = null;
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(localStorageKeyUserId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addCase(handleAuthentication.fulfilled, (state, action: PayloadAction<{ user: User; idToken: string } | null>) => {
        if (action.payload) {
          state.authenticated = true;
          state.idToken = action.payload.idToken;
          state.user = action.payload.user;
        }
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
