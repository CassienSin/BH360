import { createSlice } from '@reduxjs/toolkit';

/**
 * Convert Firestore Timestamp objects to ISO strings so Redux never stores
 * non-serializable values (fixes issue #2 / console warnings).
 */
const serializeUser = (user) => {
  if (!user) return null;
  const out = { ...user };
  const toISO = (val) => {
    if (!val) return val;
    if (typeof val.toDate === 'function') return val.toDate().toISOString();
    return val;
  };
  out.createdAt = toISO(out.createdAt);
  out.updatedAt = toISO(out.updatedAt);
  return out;
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = serializeUser(action.payload.user);
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = serializeUser({ ...state.user, ...action.payload });
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
