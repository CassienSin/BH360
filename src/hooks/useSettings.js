/**
 * useSettings hooks
 * TanStack Query wrappers for all Settings sections.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGeneralSettings,
  fetchOperationalSettings,
  fetchNotificationSettings,
  fetchPermissionsSettings,
  fetchSLASettings,
  fetchAppearanceSettings,
  fetchAuditLogs,
  saveSettingsDoc,
  SETTINGS_DOCS,
} from '../services/settingsService';

const STALE_5MIN = 5 * 60 * 1000;

// ── Query keys ────────────────────────────────────────────────────────────────

export const SETTINGS_KEYS = {
  general:       ['settings', 'general'],
  operational:   ['settings', 'operational'],
  notifications: ['settings', 'notifications'],
  permissions:   ['settings', 'permissions'],
  sla:           ['settings', 'sla'],
  appearance:    ['settings', 'appearance'],
  auditLogs:     ['settings', 'auditLogs'],
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export const useGeneralSettings = () =>
  useQuery({ queryKey: SETTINGS_KEYS.general, queryFn: fetchGeneralSettings, staleTime: STALE_5MIN });

export const useOperationalSettings = () =>
  useQuery({ queryKey: SETTINGS_KEYS.operational, queryFn: fetchOperationalSettings, staleTime: STALE_5MIN });

export const useNotificationSettings = () =>
  useQuery({ queryKey: SETTINGS_KEYS.notifications, queryFn: fetchNotificationSettings, staleTime: STALE_5MIN });

export const usePermissionsSettings = () =>
  useQuery({ queryKey: SETTINGS_KEYS.permissions, queryFn: fetchPermissionsSettings, staleTime: STALE_5MIN });

export const useSLASettings = () =>
  useQuery({ queryKey: SETTINGS_KEYS.sla, queryFn: fetchSLASettings, staleTime: STALE_5MIN });

export const useAppearanceSettings = () =>
  useQuery({ queryKey: SETTINGS_KEYS.appearance, queryFn: fetchAppearanceSettings, staleTime: STALE_5MIN });

export const useAuditLogs = () =>
  useQuery({ queryKey: SETTINGS_KEYS.auditLogs, queryFn: () => fetchAuditLogs(50), staleTime: 0 });

// ── Mutation hooks ────────────────────────────────────────────────────────────

const useSave = (docId, queryKey) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, user }) => saveSettingsDoc(docId, data, user),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: SETTINGS_KEYS.auditLogs });
    },
  });
};

export const useSaveGeneralSettings      = () => useSave(SETTINGS_DOCS.GENERAL,       SETTINGS_KEYS.general);
export const useSaveOperationalSettings  = () => useSave(SETTINGS_DOCS.OPERATIONAL,   SETTINGS_KEYS.operational);
export const useSaveNotificationSettings = () => useSave(SETTINGS_DOCS.NOTIFICATIONS, SETTINGS_KEYS.notifications);
export const useSavePermissionsSettings  = () => useSave(SETTINGS_DOCS.PERMISSIONS,   SETTINGS_KEYS.permissions);
export const useSaveSLASettings          = () => useSave(SETTINGS_DOCS.SLA,           SETTINGS_KEYS.sla);
export const useSaveAppearanceSettings   = () => useSave(SETTINGS_DOCS.APPEARANCE,    SETTINGS_KEYS.appearance);
