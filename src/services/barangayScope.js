/**
 * Barangay Scope Module
 *
 * Provides a lightweight, synchronous way to store / retrieve the current
 * user's barangay code.  All Firestore helpers in firebaseService.js consult
 * this module so that data-bearing collections are automatically nested
 * under  barangays/{code}/…  — giving every barangay its own isolated silo.
 *
 * The scope is set once on login (see firebaseAuthService.js) and cleared
 * on logout.
 */

let currentBarangayCode = null;

/**
 * Set the active barangay code (called on login / auth-state restore).
 * @param {string|null} code  PSGC barangay code, e.g. "137404001"
 */
export const setBarangayScope = (code) => {
  currentBarangayCode = code ?? null;
};

/**
 * Get the active barangay code.
 * @returns {string|null}
 */
export const getBarangayScope = () => currentBarangayCode;

/**
 * Clear the scope (called on logout).
 */
export const clearBarangayScope = () => {
  currentBarangayCode = null;
};
