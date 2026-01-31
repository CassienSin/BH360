/**
 * Custom React hooks for Tanod with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getAllTanods,
  getTanod,
  getActiveTanods,
  updateTanodStatus,
  recordAttendance,
  checkoutAttendance,
  getTanodAttendance,
  getAllAttendance,
  createSchedule,
  getTanodSchedules,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  getTanodPerformance,
} from '../services/tanodService';

// Query keys
const QUERY_KEYS = {
  ALL: ['tanods'],
  DETAIL: (id) => ['tanods', id],
  ACTIVE: ['tanods', 'active'],
  ATTENDANCE: (id) => ['attendance', id],
  ALL_ATTENDANCE: ['attendance'],
  SCHEDULES: (id) => ['schedules', id],
  ALL_SCHEDULES: ['schedules'],
  PERFORMANCE: (id) => ['tanods', 'performance', id],
};

/**
 * Hook to fetch all tanods
 */
export const useAllTanods = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL,
    queryFn: getAllTanods,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch tanod by ID
 */
export const useTanod = (tanodId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.DETAIL(tanodId),
    queryFn: () => getTanod(tanodId),
    enabled: !!tanodId,
    ...options,
  });
};

/**
 * Hook to fetch active tanods
 */
export const useActiveTanods = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVE,
    queryFn: getActiveTanods,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch tanod attendance
 */
export const useTanodAttendance = (tanodId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ATTENDANCE(tanodId),
    queryFn: () => getTanodAttendance(tanodId, options),
    enabled: !!tanodId,
    ...options,
  });
};

/**
 * Hook to fetch all attendance records
 */
export const useAllAttendance = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_ATTENDANCE,
    queryFn: () => getAllAttendance(options),
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch tanod schedules
 */
export const useTanodSchedules = (tanodId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.SCHEDULES(tanodId),
    queryFn: () => getTanodSchedules(tanodId),
    enabled: !!tanodId,
    ...options,
  });
};

/**
 * Hook to fetch all schedules
 */
export const useAllSchedules = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_SCHEDULES,
    queryFn: getAllSchedules,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch tanod performance
 */
export const useTanodPerformance = (tanodId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE(tanodId),
    queryFn: () => getTanodPerformance(tanodId),
    enabled: !!tanodId,
    staleTime: 60000,
    ...options,
  });
};

/**
 * Hook to update tanod status
 */
export const useUpdateTanodStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tanodId, status }) => updateTanodStatus(tanodId, status),
    onSuccess: (_, { tanodId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(tanodId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE });
      toast.success('Tanod status updated');
    },
    onError: (error) => {
      console.error('Error updating tanod status:', error);
      toast.error('Failed to update status');
    },
  });
};

/**
 * Hook to record attendance
 */
export const useRecordAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_ATTENDANCE });
      toast.success('Attendance recorded');
    },
    onError: (error) => {
      console.error('Error recording attendance:', error);
      toast.error('Failed to record attendance');
    },
  });
};

/**
 * Hook to checkout attendance
 */
export const useCheckoutAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attendanceId, checkOutTime }) => checkoutAttendance(attendanceId, checkOutTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_ATTENDANCE });
      toast.success('Checkout recorded');
    },
    onError: (error) => {
      console.error('Error recording checkout:', error);
      toast.error('Failed to record checkout');
    },
  });
};

/**
 * Hook to create schedule
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_SCHEDULES });
      toast.success('Schedule created');
    },
    onError: (error) => {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
    },
  });
};

/**
 * Hook to update schedule
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, updates }) => updateSchedule(scheduleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_SCHEDULES });
      toast.success('Schedule updated');
    },
    onError: (error) => {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    },
  });
};

/**
 * Hook to delete schedule
 */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_SCHEDULES });
      toast.success('Schedule deleted');
    },
    onError: (error) => {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    },
  });
};

export default {
  useAllTanods,
  useTanod,
  useActiveTanods,
  useTanodAttendance,
  useAllAttendance,
  useTanodSchedules,
  useAllSchedules,
  useTanodPerformance,
  useUpdateTanodStatus,
  useRecordAttendance,
  useCheckoutAttendance,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
};
