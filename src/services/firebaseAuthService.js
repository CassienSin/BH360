/**
 * Firebase Authentication Service
 * Handles user authentication using Firebase Auth
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setDocument, getDocument, updateDocument } from './firebaseService';
import { COLLECTIONS } from './firebaseService';

// ==================== AUTHENTICATION ====================

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    try {
      const userData = await getDocument(COLLECTIONS.USERS, user.uid);
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userData,
      };
    } catch (error) {
      // User document doesn't exist in Firestore, return basic auth data
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    }
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} additionalData - Additional user data
 * @returns {Promise<Object>} User data
 */
export const register = async (email, password, additionalData = {}) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    const userData = {
      email: user.email,
      emailVerified: user.emailVerified,
      role: additionalData.role || 'resident',
      ...additionalData,
    };
    
    await setDocument(COLLECTIONS.USERS, user.uid, userData);
    
    // Send email verification
    await sendEmailVerification(user);
    
    return {
      uid: user.uid,
      ...userData,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 */
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Update Firebase Auth profile
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });
    }
    
    // Update Firestore user document
    await updateDocument(COLLECTIONS.USERS, user.uid, profileData);
    
    return {
      uid: user.uid,
      email: user.email,
      ...profileData,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user email
 * @param {string} newEmail - New email address
 */
export const updateUserEmail = async (newEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await updateEmail(user, newEmail);
    await updateDocument(COLLECTIONS.USERS, user.uid, { email: newEmail });
    
    // Send verification email to new address
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 */
export const updateUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * Reauthenticate user (required for sensitive operations)
 * @param {string} password - Current password
 */
export const reauthenticate = async (password) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');
    
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error('Error reauthenticating:', error);
    throw error;
  }
};

/**
 * Send email verification to current user
 */
export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Get current user
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get current user with Firestore data
 * @returns {Promise<Object|null>} User data or null
 */
export const getCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userData = await getDocument(COLLECTIONS.USERS, user.uid);
    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      ...userData,
    };
  } catch (error) {
    console.error('Error getting current user data:', error);
    return null;
  }
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userData = await getDocument(COLLECTIONS.USERS, user.uid);
        callback({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...userData,
        });
      } catch (error) {
        // User document doesn't exist
        callback({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }
    } else {
      callback(null);
    }
  });
};

export default {
  signIn,
  register,
  logout,
  resetPassword,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  reauthenticate,
  sendVerificationEmail,
  getCurrentUser,
  getCurrentUserData,
  subscribeToAuthState,
};
