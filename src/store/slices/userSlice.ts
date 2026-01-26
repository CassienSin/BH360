import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from './authSlice';

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setSelectedUser,
  setLoading,
} = userSlice.actions;
export default userSlice.reducer;
