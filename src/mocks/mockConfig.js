/**
 * Mock Data Configuration
 * ──────────────────────────────────────────────────────────────
 * Set USE_MOCK_DATA to `true` to use local mock data instead of
 * Firebase for all read operations (Dashboard, Tanod Management,
 * Announcements, User Management, Analytics).
 *
 * Write operations (create / update / delete) are always no-ops
 * while mock mode is active — they log a message and resolve
 * immediately so the UI doesn't crash.
 *
 * HOW TO TOGGLE:
 *   true  → uses mock data  (no Firebase reads needed)
 *   false → uses real Firebase data (production behaviour)
 * ──────────────────────────────────────────────────────────────
 */

export const USE_MOCK_DATA = false;
