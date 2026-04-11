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
  reload,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setDocument, getDocument, updateDocument } from './firebaseService';
import { COLLECTIONS } from './firebaseService';
import { setBarangayScope, clearBarangayScope } from './barangayScope';

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

      // Activate barangay-level data isolation
      if (userData.barangayCode) {
        setBarangayScope(userData.barangayCode);
      }

      const { emailVerified: _skip, ...userDataWithoutVerification } = userData || {};
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userDataWithoutVerification,
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
      role: additionalData.role || 'resident',
      ...additionalData,
    };
    
    await setDocument(COLLECTIONS.USERS, user.uid, userData);
    
    // Send email verification
    await sendEmailVerification(user);
    
    return {
      uid: user.uid,
      emailVerified: user.emailVerified,
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
    clearBarangayScope();
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
    await updateDocument(COLLECTIONS.USERS, user.uid, {
      email: newEmail,
      emailVerified: false,
    });
    
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
 * Reload the current authenticated user and refresh verification status.
 * @returns {Promise<{ emailVerified: boolean, email: string }>} Updated auth state
 */
export const reloadCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await reload(user);
    return {
      email: user.email,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error('Error reloading current user:', error);
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
    const { emailVerified: _skip, ...userDataWithoutVerification } = userData || {};
    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      ...userDataWithoutVerification,
    };
  } catch (error) {
    console.error('Error getting current user data:', error);
    return null;
  }
};

/**
 * Subscribe to authentication state changes.
 *
 * Auto-promotion: if VITE_ADMIN_EMAIL is set in .env and the signed-in user's
 * email matches, their Firestore document is updated to role:'captain' so the
 * correct role is persisted permanently (one-time self-healing write).
 *
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await reload(user);
        const userData = await getDocument(COLLECTIONS.USERS, user.uid);

        // Activate barangay-level data isolation on session restore
        if (userData.barangayCode) {
          setBarangayScope(userData.barangayCode);
        }

        // ── Admin auto-promotion ─────────────────────────────────────────────
        // If VITE_ADMIN_EMAIL is defined in .env and matches the current user,
        // ensure their Firestore document has role:'captain'.
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (
          adminEmail &&
          user.email === adminEmail &&
          userData.role !== 'captain'
        ) {
          try {
            await updateDocument(COLLECTIONS.USERS, user.uid, { role: 'captain' });
            userData.role = 'captain';
            console.log('✅ Barangay Captain role granted to', user.email);
          } catch (err) {
            console.warn('Could not promote user to captain:', err);
          }
        }

        if (userData.emailVerified !== user.emailVerified) {
          try {
            await updateDocument(COLLECTIONS.USERS, user.uid, { emailVerified: user.emailVerified });
            userData.emailVerified = user.emailVerified;
          } catch (err) {
            console.warn('Could not sync email verification status to Firestore:', err);
          }
        }

        const { emailVerified: _skip, ...userDataWithoutVerification } = userData || {};
        callback({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...userDataWithoutVerification,
        });
      } catch (error) {
        // Firestore document missing — return basic auth data (no role default)
        callback({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }
    } else {
      clearBarangayScope();
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
  reloadCurrentUser,
  getCurrentUser,
  getCurrentUserData,
  subscribeToAuthState,
};
