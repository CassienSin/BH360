import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    addAnnouncement: (state, action) => {
      const newAnnouncement = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.announcements.unshift(newAnnouncement);
    },
    deleteAnnouncement: (state, action) => {
      state.announcements = state.announcements.filter(
        (announcement) => announcement.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { addAnnouncement, deleteAnnouncement, setLoading } = announcementSlice.actions;
export default announcementSlice.reducer;
