import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  date: Date;
  createdBy: string;
}

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
}

const initialState: AnnouncementState = {
  announcements: [
    {
      id: '1',
      title: 'Community Clean-up Drive',
      message: 'Join us this Saturday for a community clean-up drive. Meeting point at the barangay hall at 7:00 AM.',
      type: 'info',
      date: new Date(),
      createdBy: 'Admin',
    },
    {
      id: '2',
      title: 'Weather Alert',
      message: 'Heavy rainfall expected in the next 48 hours. Please take necessary precautions.',
      type: 'warning',
      date: new Date(Date.now() - 86400000),
      createdBy: 'Admin',
    },
  ],
  loading: false,
};

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    addAnnouncement: (state, action: PayloadAction<Omit<Announcement, 'id'>>) => {
      const newAnnouncement: Announcement = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.announcements.unshift(newAnnouncement);
    },
    deleteAnnouncement: (state, action: PayloadAction<string>) => {
      state.announcements = state.announcements.filter(
        (announcement) => announcement.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { addAnnouncement, deleteAnnouncement, setLoading } = announcementSlice.actions;
export default announcementSlice.reducer;
