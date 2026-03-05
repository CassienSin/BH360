/**
 * Custom React hooks for Tickets with TanStack Query + Firestore real-time
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { subscribeToQuery } from '../services/firebaseService';
import {
  createTicket,
  getAllTickets,
  getUserTickets,
  updateTicket,
  addTicketMessage,
  addTicketFeedback,
  resolveTicket,
  closeTicket,
  deleteTicket,
  getTicketStats,
} from '../services/ticketsService';

const TICKETS_COLLECTION = 'tickets';

// Query keys
const QUERY_KEYS = {
  ALL: ['tickets'],
  USER: (userId) => ['tickets', 'user', userId],
  STATS: ['tickets', 'stats'],
};

// ==================== QUERY HOOKS ====================

/**
 * Fetch all tickets (admin use)
 */
export const useAllTickets = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL,
    queryFn: getAllTickets,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Fetch tickets for a specific user
 */
export const useUserTickets = (userId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER(userId),
    queryFn: () => getUserTickets(userId),
    enabled: !!userId,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Fetch ticket statistics
 */
export const useTicketStats = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: getTicketStats,
    staleTime: 60000,
    ...options,
  });
};

// ==================== REAL-TIME HOOKS ====================

/**
 * Subscribe to all tickets in real-time (admin use)
 */
export const useAllTicketsRealtime = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToQuery(
      TICKETS_COLLECTION,
      [],
      { orderBy: { field: 'createdAt', direction: 'desc' } },
      (tickets) => {
        setData(tickets);
        setLoading(false);
        setError(null);
      }
    );
    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};

/**
 * Subscribe to a user's tickets in real-time
 */
export const useUserTicketsRealtime = (userId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToQuery(
      TICKETS_COLLECTION,
      [{ field: 'userId', operator: '==', value: userId }],
      { orderBy: { field: 'createdAt', direction: 'desc' } },
      (tickets) => {
        setData(tickets);
        setLoading(false);
        setError(null);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  return { data, loading, error };
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
    onError: () => {
      toast.error('Failed to create ticket. Please try again.');
    },
  });
};

/**
 * Update ticket fields (status, priority, etc.)
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, updates }) => updateTicket(ticketId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
    onError: () => {
      toast.error('Failed to update ticket.');
    },
  });
};

/**
 * Add a message to a ticket thread
 */
export const useAddTicketMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message }) => addTicketMessage(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
    },
    onError: () => {
      toast.error('Failed to send reply.');
    },
  });
};

/**
 * Add feedback/rating to a resolved ticket
 */
export const useAddTicketFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, feedback }) => addTicketFeedback(ticketId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      toast.success('Thank you for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit feedback.');
    },
  });
};

/**
 * Resolve a ticket
 */
export const useResolveTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, resolution }) => resolveTicket(ticketId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Ticket resolved.');
    },
    onError: () => {
      toast.error('Failed to resolve ticket.');
    },
  });
};

/**
 * Close a ticket
 */
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
    onError: () => {
      toast.error('Failed to close ticket.');
    },
  });
};

/**
 * Delete a ticket
 */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('Ticket deleted.');
    },
    onError: () => {
      toast.error('Failed to delete ticket.');
    },
  });
};

export default {
  useAllTickets,
  useUserTickets,
  useTicketStats,
  useAllTicketsRealtime,
  useUserTicketsRealtime,
  useCreateTicket,
  useUpdateTicket,
  useAddTicketMessage,
  useAddTicketFeedback,
  useResolveTicket,
  useCloseTicket,
  useDeleteTicket,
};
