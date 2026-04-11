/**
 * Barangay Roles Configuration
 * ──────────────────────────────────────────────────────────────
 * Central source of truth for all role-related constants.
 *
 * Real Philippine barangay governance roles:
 *   captain   — Punong Barangay (Barangay Captain), full admin
 *   kagawad   — Barangay Kagawad (Councilor), senior staff
 *   secretary — Barangay Secretary, records & admin staff
 *   tanod     — Barangay Tanod, peace & order / field ops
 *   resident  — Registered barangay resident
 *
 * The role value stored on each user document is one of ROLE_VALUES.
 * All UI labels, colours, permission defaults, etc. derive from this file.
 * ──────────────────────────────────────────────────────────────
 */

// ── Role identifiers (stored in Firestore `users.role`) ─────────────────────
export const ROLE_CAPTAIN   = 'captain';
export const ROLE_KAGAWAD   = 'kagawad';
export const ROLE_SECRETARY = 'secretary';
export const ROLE_TANOD     = 'tanod';
export const ROLE_RESIDENT  = 'resident';

/** Ordered list of all valid role values (highest → lowest authority). */
export const ROLE_VALUES = [
  ROLE_CAPTAIN,
  ROLE_KAGAWAD,
  ROLE_SECRETARY,
  ROLE_TANOD,
  ROLE_RESIDENT,
];

// ── Human-readable labels ───────────────────────────────────────────────────
export const ROLE_OPTIONS = [
  { value: ROLE_CAPTAIN,   label: 'Barangay Captain' },
  { value: ROLE_KAGAWAD,   label: 'Kagawad' },
  { value: ROLE_SECRETARY, label: 'Secretary' },
  { value: ROLE_TANOD,     label: 'Tanod' },
  { value: ROLE_RESIDENT,  label: 'Resident' },
];

/** Quick lookup: value → label */
export const ROLE_LABEL_MAP = Object.fromEntries(
  ROLE_OPTIONS.map(({ value, label }) => [value, label]),
);

// ── MUI chip / badge colours per role ───────────────────────────────────────
export const ROLE_COLORS = {
  [ROLE_CAPTAIN]:   'primary',
  [ROLE_KAGAWAD]:   'secondary',
  [ROLE_SECRETARY]: 'info',
  [ROLE_TANOD]:     'warning',
  [ROLE_RESIDENT]:  'default',
};

// ── Helper predicates ───────────────────────────────────────────────────────

/** Roles that have full administrative access. */
export const isAdminRole = (role) => role === ROLE_CAPTAIN;

/** Roles that have staff-level (management) access. */
export const isStaffRole = (role) =>
  role === ROLE_CAPTAIN || role === ROLE_KAGAWAD || role === ROLE_SECRETARY;

/** Roles that perform field operations (tanod duties). */
export const isTanodRole = (role) => role === ROLE_TANOD;

/** All roles — convenience for sidebar / permission arrays. */
export const ALL_ROLES = ROLE_VALUES;

/** Admin + staff roles. */
export const ADMIN_STAFF_ROLES = [ROLE_CAPTAIN, ROLE_KAGAWAD, ROLE_SECRETARY];

/** Default role assigned to new registrations. */
export const DEFAULT_ROLE = ROLE_RESIDENT;
