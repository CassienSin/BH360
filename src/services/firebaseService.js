/**
 * Firebase Service
 * Core utilities for Firestore database operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== COLLECTION REFERENCES ====================

/**
 * Collection names used in Firestore
 */
export const COLLECTIONS = {
  USERS: 'users',
  INCIDENTS: 'incidents',
  TANOD: 'tanod',
  ATTENDANCE: 'attendance',
  SCHEDULES: 'schedules',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
};

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new document in a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Document data
 * @returns {Promise<string>} Document ID
 */
export const createDocument = async (collectionName, data) => {
  try {
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Create a document with a custom ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 */
export const setDocument = async (collectionName, docId, data) => {
  try {
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, collectionName, docId), dataWithTimestamp);
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get a single document by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document data with id
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get all documents from a collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Array>} Array of documents
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Fields to update
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// ==================== QUERY OPERATIONS ====================

/**
 * Query documents with filters
 * @param {string} collectionName - Name of the collection
 * @param {Array} filters - Array of filter objects [{field, operator, value}]
 * @param {Object} options - Query options (orderBy, limit, etc.)
 * @returns {Promise<Array>} Array of documents
 */
export const queryDocuments = async (collectionName, filters = [], options = {}) => {
  try {
    let q = collection(db, collectionName);
    
    // Build query constraints
    const constraints = [];
    
    // Add filters
    filters.forEach(({ field, operator, value }) => {
      constraints.push(where(field, operator, value));
    });
    
    // Add orderBy
    if (options.orderBy) {
      const { field, direction = 'asc' } = options.orderBy;
      constraints.push(orderBy(field, direction));
    }
    
    // Add limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    // Add pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }
    
    // Create query
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get documents by field value
 * @param {string} collectionName - Name of the collection
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {Promise<Array>} Array of documents
 */
export const getDocumentsByField = async (collectionName, field, value) => {
  return queryDocuments(collectionName, [{ field, operator: '==', value }]);
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Subscribe to real-time updates for a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to document in ${collectionName}:`, error);
    }
  );
};

/**
 * Subscribe to real-time updates for a collection query
 * @param {string} collectionName - Name of the collection
 * @param {Array} filters - Array of filter objects
 * @param {Object} options - Query options
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToQuery = (collectionName, filters = [], options = {}, callback) => {
  let q = collection(db, collectionName);
  
  // Build query constraints
  const constraints = [];
  
  filters.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator, value));
  });
  
  if (options.orderBy) {
    const { field, direction = 'asc' } = options.orderBy;
    constraints.push(orderBy(field, direction));
  }
  
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  
  q = query(q, ...constraints);
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(documents);
    },
    (error) => {
      console.error(`Error subscribing to query in ${collectionName}:`, error);
    }
  );
};

// ==================== BATCH OPERATIONS ====================

/**
 * Batch write multiple documents
 * @param {Array} operations - Array of operations [{type, collectionName, docId, data}]
 */
export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);
    
    operations.forEach(({ type, collectionName, docId, data }) => {
      const docRef = docId 
        ? doc(db, collectionName, docId)
        : doc(collection(db, collectionName));
      
      switch (type) {
        case 'set':
          batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'update':
          batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
        default:
          console.warn(`Unknown batch operation type: ${type}`);
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error performing batch write:', error);
    throw error;
  }
};

// ==================== TRANSACTION OPERATIONS ====================

/**
 * Run a transaction
 * @param {Function} transactionFunction - Function that performs transaction operations
 * @returns {Promise<any>} Transaction result
 */
export const runFirestoreTransaction = async (transactionFunction) => {
  try {
    return await runTransaction(db, transactionFunction);
  } catch (error) {
    console.error('Error running transaction:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert Firestore Timestamp to Date
 * @param {Timestamp} timestamp - Firestore timestamp
 * @returns {Date} JavaScript Date object
 */
export const timestampToDate = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

/**
 * Convert Date to Firestore Timestamp
 * @param {Date} date - JavaScript Date object
 * @returns {Timestamp} Firestore timestamp
 */
export const dateToTimestamp = (date) => {
  return Timestamp.fromDate(date);
};

/**
 * Get current server timestamp
 * @returns {FieldValue} Server timestamp
 */
export const getServerTimestamp = () => {
  return serverTimestamp();
};

/**
 * Check if Firebase is initialized
 * @returns {boolean} True if initialized
 */
export const isFirebaseInitialized = () => {
  return !!db;
};

export default {
  COLLECTIONS,
  createDocument,
  setDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  getDocumentsByField,
  subscribeToDocument,
  subscribeToQuery,
  batchWrite,
  runFirestoreTransaction,
  timestampToDate,
  dateToTimestamp,
  getServerTimestamp,
  isFirebaseInitialized,
};
