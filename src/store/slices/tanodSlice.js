import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tanodMembers: [],
  dutySchedules: [],
  attendanceRecords: [],
  incidentResponses: [],
  patrolAreas: [],
  selectedTanod: null,
  loading: false,
  error: null,
};

const tanodSlice = createSlice({
  name: 'tanod',
  initialState,
  reducers: {
    // Tanod Members
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
    deleteTanodMember: (state, action) => {
      state.tanodMembers = state.tanodMembers.filter((t) => t.id !== action.payload);
    },
    
    // Duty Schedules
    setDutySchedules: (state, action) => {
      state.dutySchedules = action.payload;
    },
    addDutySchedule: (state, action) => {
      state.dutySchedules.push(action.payload);
    },
    updateDutySchedule: (state, action) => {
      const index = state.dutySchedules.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.dutySchedules[index] = action.payload;
      }
    },
    deleteDutySchedule: (state, action) => {
      state.dutySchedules = state.dutySchedules.filter((s) => s.id !== action.payload);
    },
    
    // Attendance Records
    setAttendanceRecords: (state, action) => {
      state.attendanceRecords = action.payload;
    },
    addAttendanceRecord: (state, action) => {
      state.attendanceRecords.push(action.payload);
    },
    updateAttendanceRecord: (state, action) => {
      const index = state.attendanceRecords.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.attendanceRecords[index] = action.payload;
      }
    },
    
    // Incident Responses
    setIncidentResponses: (state, action) => {
      state.incidentResponses = action.payload;
    },
    addIncidentResponse: (state, action) => {
      state.incidentResponses.push(action.payload);
    },
    
    // Patrol Areas
    setPatrolAreas: (state, action) => {
      state.patrolAreas = action.payload;
    },
    addPatrolArea: (state, action) => {
      state.patrolAreas.push(action.payload);
    },
    updatePatrolArea: (state, action) => {
      const index = state.patrolAreas.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.patrolAreas[index] = action.payload;
      }
    },
    
    // Selected Tanod
    setSelectedTanod: (state, action) => {
      state.selectedTanod = action.payload;
    },
    
    // Loading & Error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTanodMembers,
  addTanodMember,
  updateTanodMember,
  deleteTanodMember,
  setDutySchedules,
  addDutySchedule,
  updateDutySchedule,
  deleteDutySchedule,
  setAttendanceRecords,
  addAttendanceRecord,
  updateAttendanceRecord,
  setIncidentResponses,
  addIncidentResponse,
  setPatrolAreas,
  addPatrolArea,
  updatePatrolArea,
  setSelectedTanod,
  setLoading,
  setError,
} = tanodSlice.actions;

export default tanodSlice.reducer;
