import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface TanodMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  patrolArea: string;
  shift: 'day' | 'night';
  status: 'on-duty' | 'off-duty' | 'on-leave';
  performanceRating: number;
  incidentsResolved: number;
  createdAt: string;
}

export interface DutySchedule {
  id: string;
  tanodId: string;
  date: string;
  shift: 'day' | 'night';
  patrolArea: string;
  startTime: string;
  endTime: string;
  checkIn?: string;
  checkOut?: string;
  status: 'scheduled' | 'completed' | 'missed';
}

interface TanodState {
  tanodMembers: TanodMember[];
  dutySchedules: DutySchedule[];
  selectedTanod: TanodMember | null;
  loading: boolean;
}

const initialState: TanodState = {
  tanodMembers: [],
  dutySchedules: [],
  selectedTanod: null,
  loading: false,
};

const tanodSlice = createSlice({
  name: 'tanod',
  initialState,
  reducers: {
    setTanodMembers: (state, action: PayloadAction<TanodMember[]>) => {
      state.tanodMembers = action.payload;
    },
    addTanodMember: (state, action: PayloadAction<TanodMember>) => {
      state.tanodMembers.push(action.payload);
    },
    updateTanodMember: (state, action: PayloadAction<TanodMember>) => {
      const index = state.tanodMembers.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tanodMembers[index] = action.payload;
      }
    },
    setDutySchedules: (state, action: PayloadAction<DutySchedule[]>) => {
      state.dutySchedules = action.payload;
    },
    addDutySchedule: (state, action: PayloadAction<DutySchedule>) => {
      state.dutySchedules.push(action.payload);
    },
    setSelectedTanod: (state, action: PayloadAction<TanodMember | null>) => {
      state.selectedTanod = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
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
