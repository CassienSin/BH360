/**
 * Custom React hooks for Announcements with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getAllAnnouncements,
  getPublishedAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../services/announcementsService';

// Query keys
const QUERY_KEYS = {
  ALL: ['announcements'],
  PUBLISHED: ['announcements', 'published'],
  DETAIL: (id) => ['announcements', id],
};

/**
 * Hook to fetch all announcements (admin)
 */
export const useAllAnnouncements = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL,
    queryFn: getAllAnnouncements,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch only published announcements (residents)
 */
export const usePublishedAnnouncements = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.PUBLISHED,
    queryFn: () => getPublishedAnnouncements(50),
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to create an announcement
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PUBLISHED });
      toast.success('Announcement created successfully!');
    },
    onError: (error) => {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement. Please try again.');
    },
  });
};

/**
 * Hook to update an announcement
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ announcementId, updates }) => updateAnnouncement(announcementId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PUBLISHED });
      toast.success('Announcement updated successfully');
    },
    onError: (error) => {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    },
  });
};

/**
 * Hook to delete an announcement
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PUBLISHED });
      toast.success('Announcement deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    },
  });
};

export default {
  useAllAnnouncements,
  usePublishedAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
};
