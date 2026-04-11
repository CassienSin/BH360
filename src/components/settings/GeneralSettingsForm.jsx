import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stack, TextField, MenuItem, LinearProgress, Alert, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { useGeneralSettings, useSaveGeneralSettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import { queryDocuments, COLLECTIONS } from '../../services/firebaseService';
import { getBarangayScope } from '../../services/barangayScope';
import SettingsSectionCard from './SettingsSectionCard';

const TIMEZONES   = ['Asia/Manila (UTC+8)', 'Asia/Tokyo (UTC+9)', 'UTC (UTC+0)', 'America/New_York (UTC-5)'];
const LANGUAGES   = ['English', 'Bisaya / Cebuano'];
const DATE_FMTS   = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

const GeneralSettingsForm = forwardRef(function GeneralSettingsForm({ onDirty }, ref) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = useGeneralSettings();
  const saveMutation = useSaveGeneralSettings();

  const { data: captain } = useQuery({
    queryKey: ['captain', getBarangayScope()],
    queryFn: async () => {
      const users = await queryDocuments(COLLECTIONS.USERS, [
        { field: 'role', operator: '==', value: 'captain' },
        { field: 'barangayCode', operator: '==', value: getBarangayScope() },
      ]);
      return users[0] || null;
    },
    enabled: !!getBarangayScope(),
  });

  const [info, setInfo] = useState(DEFAULTS.general);
  const [locale, setLocale] = useState({
    timezone:   DEFAULTS.general.timezone,
    language:   DEFAULTS.general.language,
    dateFormat: DEFAULTS.general.dateFormat,
  });

  useEffect(() => {
    if (data) {
      const fallbackInfo = {
        name:         data.name         ?? DEFAULTS.general.name,
        municipality: data.municipality ?? DEFAULTS.general.municipality,
        province:     data.province     ?? DEFAULTS.general.province,
        zipCode:      data.zipCode      ?? DEFAULTS.general.zipCode,
        phone:        data.phone        ?? DEFAULTS.general.phone,
        version:      data.version      ?? DEFAULTS.general.version,
      };

      const resolvedInfo = {
        ...fallbackInfo,
        name:         fallbackInfo.name === DEFAULTS.general.name && user?.barangay ? user.barangay : fallbackInfo.name,
        municipality: fallbackInfo.municipality === DEFAULTS.general.municipality && user?.city ? user.city : fallbackInfo.municipality,
        province:     fallbackInfo.province === DEFAULTS.general.province && user?.province ? user.province : fallbackInfo.province,
        zipCode:      fallbackInfo.zipCode === DEFAULTS.general.zipCode && user?.zipCode ? user.zipCode : fallbackInfo.zipCode,
      };

      setInfo(resolvedInfo);
      setLocale({
        timezone:   data.timezone   ?? DEFAULTS.general.timezone,
        language:   data.language   ?? DEFAULTS.general.language,
        dateFormat: data.dateFormat ?? DEFAULTS.general.dateFormat,
      });
    }
  }, [data, user?.barangay, user?.city, user?.province]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      const payload = { ...info, ...locale };
      await saveMutation.mutateAsync({ data: payload, user });
      dispatch(updateUser({ localization: locale }));
      await addAuditLog({
        action:   'Updated General & Localization settings',
        category: 'Settings',
        user,
      });
    },
  }), [info, locale, saveMutation, user, dispatch]);

  const handleInfo   = (field) => (e) => { setInfo((p)   => ({ ...p, [field]: e.target.value })); onDirty?.(); };
  const handleLocale = (field) => (e) => { setLocale((p) => ({ ...p, [field]: e.target.value })); onDirty?.(); };

  if (isLoading) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError)   return <Alert severity="error">Failed to load general settings.</Alert>;

  return (
    <Stack spacing={2}>
      {/* Barangay Information */}
      <SettingsSectionCard
        title="🏢 Barangay Information"
        description="Basic details about your barangay shown in documents and reports."
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" label="Barangay Name" value={info.name} disabled />
            <TextField fullWidth size="small" label="Municipality / City" value={info.municipality} disabled />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" label="Province"  value={info.province} disabled />
            <TextField fullWidth size="small" label="Zip Code"  value={info.zipCode} disabled />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" label="Barangay Captain" value={captain ? `${captain.firstName} ${captain.lastName}` : 'Not assigned'} disabled />
            <TextField fullWidth size="small" label="System Version"   value={info.version} disabled helperText="Managed automatically by the system" />
          </Stack>
        </Stack>
      </SettingsSectionCard>

      {/* Localization */}
      <SettingsSectionCard
        title="🌏 Localization"
        description="Date formats, timezone and language preferences."
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField fullWidth size="small" select label="Timezone"    value={locale.timezone}   onChange={handleLocale('timezone')}>
            {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
          </TextField>
          <TextField fullWidth size="small" select label="Language"    value={locale.language}   onChange={handleLocale('language')}>
            {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
          <TextField fullWidth size="small" select label="Date Format" value={locale.dateFormat} onChange={handleLocale('dateFormat')}>
            {DATE_FMTS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
        </Stack>
      </SettingsSectionCard>
    </Stack>
  );
});

export default GeneralSettingsForm;
