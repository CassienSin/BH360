/**
 * useSettings hooks
 * TanStack Query wrappers for Settings sections.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGeneralSettings,
  fetchNotificationSettings,
  fetchAppearanceSettings,
  saveSettingsDoc,
  SETTINGS_DOCS,
} from '../services/settingsService';
import { getBarangayScope } from '../services/barangayScope';

const STALE_5MIN = 5 * 60 * 1000;

// ── Query keys ────────────────────────────────────────────────────────────────

export const SETTINGS_KEYS = {
  general:       ['settings', 'general'],
  notifications: ['settings', 'notifications'],
  appearance:    ['settings', 'appearance'],
};

const createScopedQueryKey = (baseKey) => {
  const scope = getBarangayScope();
  return scope ? [...baseKey, scope] : baseKey;
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export const useGeneralSettings = () =>
  useQuery({
    queryKey: createScopedQueryKey(SETTINGS_KEYS.general),
    queryFn: fetchGeneralSettings,
    staleTime: STALE_5MIN,
  });

export const useNotificationSettings = () =>
  useQuery({
    queryKey: createScopedQueryKey(SETTINGS_KEYS.notifications),
    queryFn: fetchNotificationSettings,
    staleTime: STALE_5MIN,
  });

export const useAppearanceSettings = () =>
  useQuery({
    queryKey: createScopedQueryKey(SETTINGS_KEYS.appearance),
    queryFn: fetchAppearanceSettings,
    staleTime: STALE_5MIN,
  });

// ── Mutation hooks ───────────────────────────────────────────────────────────

const useSave = (docId, baseQueryKey) => {
  const qc = useQueryClient();
  const queryKey = createScopedQueryKey(baseQueryKey);

  return useMutation({
    mutationFn: ({ data, user }) => saveSettingsDoc(docId, data, user),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });
};

export const useSaveGeneralSettings      = () => useSave(SETTINGS_DOCS.GENERAL,       SETTINGS_KEYS.general);
export const useSaveNotificationSettings = () => useSave(SETTINGS_DOCS.NOTIFICATIONS, SETTINGS_KEYS.notifications);
export const useSaveAppearanceSettings   = () => useSave(SETTINGS_DOCS.APPEARANCE,    SETTINGS_KEYS.appearance);
