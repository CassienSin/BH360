/**
 * Custom React hooks for Firestore operations with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  subscribeToDocument,
  subscribeToQuery,
} from '../services/firebaseService';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch a single document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @param {Object} options - React Query options
 */
export const useDocument = (collectionName, docId, options = {}) => {
  return useQuery({
    queryKey: [collectionName, docId],
    queryFn: () => getDocument(collectionName, docId),
    enabled: !!docId,
    ...options,
  });
};

/**
 * Hook to fetch all documents from a collection
 * @param {string} collectionName - Collection name
 * @param {Object} options - React Query options
 */
export const useCollection = (collectionName, options = {}) => {
  return useQuery({
    queryKey: [collectionName],
    queryFn: () => getAllDocuments(collectionName),
    ...options,
  });
};

/**
 * Hook to query documents with filters
 * @param {string} collectionName - Collection name
 * @param {Array} filters - Query filters
 * @param {Object} queryOptions - Query options (orderBy, limit, etc.)
 * @param {Object} reactQueryOptions - React Query options
 */
export const useQuery = (collectionName, filters = [], queryOptions = {}, reactQueryOptions = {}) => {
  const queryKey = [collectionName, 'query', JSON.stringify(filters), JSON.stringify(queryOptions)];
  
  return useQuery({
    queryKey,
    queryFn: () => queryDocuments(collectionName, filters, queryOptions),
    ...reactQueryOptions,
  });
};

// ==================== REAL-TIME HOOKS ====================

/**
 * Hook to subscribe to real-time document updates
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 */
export const useDocumentRealtime = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDocument(
      collectionName,
      docId,
      (document) => {
        setData(document);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * Hook to subscribe to real-time collection query updates
 * @param {string} collectionName - Collection name
 * @param {Array} filters - Query filters
 * @param {Object} options - Query options
 */
export const useCollectionRealtime = (collectionName, filters = [], options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToQuery(
      collectionName,
      filters,
      options,
      (documents) => {
        setData(documents);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters), JSON.stringify(options)]);

  return { data, loading, error };
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a document
 * @param {string} collectionName - Collection name
 */
export const useCreateDocument = (collectionName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createDocument(collectionName, data),
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
};

/**
 * Hook to update a document
 * @param {string} collectionName - Collection name
 */
export const useUpdateDocument = (collectionName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, data }) => updateDocument(collectionName, docId, data),
    onSuccess: (_, { docId }) => {
      // Invalidate specific document and collection queries
      queryClient.invalidateQueries({ queryKey: [collectionName, docId] });
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
};

/**
 * Hook to delete a document
 * @param {string} collectionName - Collection name
 */
export const useDeleteDocument = (collectionName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId) => deleteDocument(collectionName, docId),
    onSuccess: (_, docId) => {
      // Invalidate specific document and collection queries
      queryClient.invalidateQueries({ queryKey: [collectionName, docId] });
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
};

// ==================== COMBINED HOOKS ====================

/**
 * Hook that provides CRUD operations for a collection
 * @param {string} collectionName - Collection name
 */
export const useFirestore = (collectionName) => {
  const create = useCreateDocument(collectionName);
  const update = useUpdateDocument(collectionName);
  const remove = useDeleteDocument(collectionName);

  return {
    create,
    update,
    remove,
  };
};

export default {
  useDocument,
  useCollection,
  useQuery,
  useDocumentRealtime,
  useCollectionRealtime,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useFirestore,
};
