import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: 'crime' | 'noise' | 'dispute' | 'hazard' | 'other';
  priority: 'minor' | 'urgent' | 'emergency';
  status: 'submitted' | 'in-progress' | 'resolved';
  location: {
    address: string;
    coordinates: [number, number];
  };
  images?: string[];
  videos?: string[];
  reporterId: string;
  reporterName: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  filters: {
    status?: string;
    category?: string;
    priority?: string;
    dateRange?: [string, string];
  };
  loading: boolean;
}

const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  filters: {},
  loading: false,
};

const incidentSlice = createSlice({
  name: 'incident',
  initialState,
  reducers: {
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.incidents = action.payload;
    },
    addIncident: (state, action: PayloadAction<Incident>) => {
      state.incidents.unshift(action.payload);
    },
    updateIncident: (state, action: PayloadAction<Incident>) => {
      const index = state.incidents.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.incidents[index] = action.payload;
      }
      if (state.selectedIncident?.id === action.payload.id) {
        state.selectedIncident = action.payload;
      }
    },
    setSelectedIncident: (state, action: PayloadAction<Incident | null>) => {
      state.selectedIncident = action.payload;
    },
    setFilters: (state, action: PayloadAction<IncidentState['filters']>) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
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
