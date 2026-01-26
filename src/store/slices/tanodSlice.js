import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tanodMembers: [],
  dutySchedules: [],
  selectedTanod: null,
  loading: false,
};

const tanodSlice = createSlice({
  name: 'tanod',
  initialState,
  reducers: {
    setTanodMembers: (state, action) => {
      state.tanodMembers = action.payload;
    },
    addTanodMember: (state, action) => {
      state.tanodMembers.push(action.payload);
    },
    updateTanodMember: (state, action) => {
      const index = state.tanodMembers.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tanodMembers[index] = action.payload;
      }
    },
    setDutySchedules: (state, action) => {
      state.dutySchedules = action.payload;
    },
    addDutySchedule: (state, action) => {
      state.dutySchedules.push(action.payload);
    },
    setSelectedTanod: (state, action) => {
      state.selectedTanod = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setTanodMembers,
  addTanodMember,
  updateTanodMember,
  setDutySchedules,
  addDutySchedule,
  setSelectedTanod,
  setLoading,
} = tanodSlice.actions;
export default tanodSlice.reducer;
