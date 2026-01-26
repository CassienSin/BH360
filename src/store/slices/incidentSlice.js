import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  incidents: [],
  selectedIncident: null,
  filters: {},
  loading: false,
};

const incidentSlice = createSlice({
  name: 'incident',
  initialState,
  reducers: {
    setIncidents: (state, action) => {
      state.incidents = action.payload;
    },
    addIncident: (state, action) => {
      state.incidents.unshift(action.payload);
    },
    updateIncident: (state, action) => {
      const index = state.incidents.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.incidents[index] = action.payload;
      }
      if (state.selectedIncident?.id === action.payload.id) {
        state.selectedIncident = action.payload;
      }
    },
    setSelectedIncident: (state, action) => {
      state.selectedIncident = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setIncidents,
  addIncident,
  updateIncident,
  setSelectedIncident,
  setFilters,
  setLoading,
} = incidentSlice.actions;
export default incidentSlice.reducer;
