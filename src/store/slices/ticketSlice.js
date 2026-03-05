import { createSlice } from '@reduxjs/toolkit';

// Ticket data is now managed by Firestore via useTickets hooks.
// This slice is kept for compatibility; UI-only state lives here.
const initialState = {
  loading: false,
};

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setLoading } = ticketSlice.actions;
export default ticketSlice.reducer;
