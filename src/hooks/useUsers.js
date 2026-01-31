/**
 * Custom React hooks for Users with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getUser,
  getAllUsers,
  getUsersByRole,
  updateUserProfile,
  updateUserRole,
  deleteUser,
  searchUsers,
  getUserStats,
} from '../services/usersService';

// Query keys
const QUERY_KEYS = {
  ALL: ['users'],
  DETAIL: (id) => ['users', id],
  BY_ROLE: (role) => ['users', 'role', role],
  SEARCH: (term) => ['users', 'search', term],
  STATS: ['users', 'stats'],
};

/**
 * Hook to fetch all users
 */
export const useAllUsers = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL,
    queryFn: getAllUsers,
    staleTime: 30000,
    ...options,
  });
};

/**
 * Hook to fetch user by ID
 */
export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.DETAIL(userId),
    queryFn: () => getUser(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to fetch users by role
 */
export const useUsersByRole = (role, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.BY_ROLE(role),
    queryFn: () => getUsersByRole(role),
    enabled: !!role,
    ...options,
  });
};

/**
 * Hook to search users
 */
export const useSearchUsers = (searchTerm, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH(searchTerm),
    queryFn: () => searchUsers(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2,
    ...options,
  });
};

/**
 * Hook to fetch user statistics
 */
export const useUserStats = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: getUserStats,
    staleTime: 60000,
    ...options,
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }) => updateUserProfile(userId, updates),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      toast.success('User profile updated');
    },
    onError: (error) => {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile');
    },
  });
};

/**
 * Hook to update user role
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DETAIL(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('User role updated');
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast.error('Failed to update role');
    },
  });
};

/**
 * Hook to delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      toast.success('User deleted');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    },
  });
};

export default {
  useAllUsers,
  useUser,
  useUsersByRole,
  useSearchUsers,
  useUserStats,
  useUpdateUserProfile,
  useUpdateUserRole,
  useDeleteUser,
};
