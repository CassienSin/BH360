/**
 * Custom React hooks for Incidents with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  createIncident,
  getIncident,
  getAllIncidents,
  getIncidentsByStatus,
  getIncidentsByTanod,
  getRecentIncidents,
  updateIncident,
  assignIncident,
  resolveIncident,
  deleteIncident,
  subscribeToIncidents,
  getIncidentStats,
  markIncidentAsFalseReport,
} from '../services/incidentsService';
import { useAppSelector } from '../store/hooks';
import {
  notifyNewIncident,
  notifyTaskAssigned,
  notifyIncidentResolved,
} from '../services/notificationService';

// Query keys
const QUERY_KEYS = {
  ALL: ['incidents'],
  DETAIL: (id) => ['incidents', id],
  BY_STATUS: (status) => ['incidents', 'status', status],
  BY_TANOD: (tanodId) => ['incidents', 'tanod', tanodId],
  RECENT: (limit) => ['incidents', 'recent', limit],
  STATS: ['incidents', 'stats'],
};

/**
 * Hook to fetch all incidents
 */
export const useAllIncidents = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL,
    queryFn: getAllIncidents,
    staleTime: 30000, // 30 seconds
    ...options,
  });
};

/**
 * Hook to fetch incident by ID
 */
export const useIncident = (incidentId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.DETAIL(incidentId),
    queryFn: () => getIncident(incidentId),
    enabled: !!incidentId,
    ...options,
  });
};

/**
 * Hook to fetch incidents by status
 */
export const useIncidentsByStatus = (status, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.BY_STATUS(status),
    queryFn: () => getIncidentsByStatus(status),
    enabled: !!status,
    ...options,
  });
};

/**
 * Hook to fetch incidents assigned to a tanod
 */
export const useIncidentsByTanod = (tanodId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.BY_TANOD(tanodId),
    queryFn: () => getIncidentsByTanod(tanodId),
    enabled: !!tanodId,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch recent incidents
 */
export const useRecentIncidents = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECENT(limit),
    queryFn: () => getRecentIncidents(limit),
    ...options,
  });
};

/**
 * Hook to fetch incident statistics
 */
export const useIncidentStats = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: getIncidentStats,
    staleTime: 60000, // 1 minute
    ...options,
  });
};

/**
 * Hook for real-time incident updates
 */
export const useIncidentsRealtime = (filters = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToIncidents(filters, (incidents) => {
      setData(incidents);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
};

/**
 * Hook to create incident
 */
export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: createIncident,
    onSuccess: async (incidentId, incidentData) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Incident reported successfully');

      notifyNewIncident({
        incidentId,
        incident: incidentData,
        currentUserId: user?.id,
        currentUserRole: user?.role,
      }).catch((error) => {
        console.warn('Incident notification failed:', error);
      });
    },
    onError: (error) => {
      console.error('Error creating incident:', error);
      const errorMessage = error?.message || 'Failed to create incident';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to mark an incident as false report and warn the reporter
 */
export const useMarkIncidentFalseReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: ({ incidentId, reporterId, note }) =>
      markIncidentAsFalseReport({
        incidentId,
        reporterId,
        updatedBy: user?.uid || user?.email || 'Tanod',
        note,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(variables?.reporterId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(variables?.incidentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Reporter warned and incident marked as false report');
    },
    onError: (error) => {
      console.error('Error marking false report:', error);
      const errorMessage = error?.message || 'Failed to flag incident as false report';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update incident
 */
export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ incidentId, updates }) => updateIncident(incidentId, updates),
    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(incidentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Incident updated successfully');
    },
    onError: (error) => {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
    },
  });
};

/**
 * Hook to assign incident
 */
export const useAssignIncident = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: ({ incidentId, tanodId }) => assignIncident(incidentId, tanodId),
    onSuccess: async (_, { incidentId, tanodId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(incidentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      toast.success('Incident assigned successfully');

      notifyTaskAssigned({
        incidentId,
        assignedTo: tanodId,
        currentUserId: user?.id,
        currentUserRole: user?.role,
      }).catch((error) => {
        console.warn('Task assignment notification failed:', error);
      });
    },
    onError: (error) => {
      console.error('Error assigning incident:', error);
      toast.error('Failed to assign incident');
    },
  });
};

/**
 * Hook to resolve incident
 */
export const useResolveIncident = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: ({ incidentId, resolution }) => resolveIncident(incidentId, resolution),
    onSuccess: async (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(incidentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Incident resolved successfully');

      notifyIncidentResolved({
        incidentId,
        currentUserId: user?.id,
        currentUserRole: user?.role,
      }).catch((error) => {
        console.warn('Resolve notification failed:', error);
      });
    },
    onError: (error) => {
      console.error('Error resolving incident:', error);
      toast.error('Failed to resolve incident');
    },
  });
};

/**
 * Hook to delete incident
 */
export const useDeleteIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Incident deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting incident:', error);
      toast.error('Failed to delete incident');
    },
  });
};

export default {
  useAllIncidents,
  useIncident,
  useIncidentsByStatus,
  useIncidentsByTanod,
  useRecentIncidents,
  useIncidentStats,
  useIncidentsRealtime,
  useCreateIncident,
  useUpdateIncident,
  useAssignIncident,
  useResolveIncident,
  useDeleteIncident,
};
