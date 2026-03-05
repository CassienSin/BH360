import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stack, TextField, MenuItem, LinearProgress, Alert, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { useGeneralSettings, useSaveGeneralSettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import { updateUserProfile } from '../../services/usersService';
import SettingsSectionCard from './SettingsSectionCard';

const TIMEZONES   = ['Asia/Manila (UTC+8)', 'Asia/Tokyo (UTC+9)', 'UTC (UTC+0)', 'America/New_York (UTC-5)'];
const LANGUAGES   = ['English', 'Bisaya / Cebuano'];
const DATE_FMTS   = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

const GeneralSettingsForm = forwardRef(function GeneralSettingsForm({ onDirty, readOnly = false }, ref) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = useGeneralSettings();
  const saveMutation = useSaveGeneralSettings();

  const [info, setInfo] = useState(DEFAULTS.general);
  const [locale, setLocale] = useState({
    timezone:   DEFAULTS.general.timezone,
    language:   DEFAULTS.general.language,
    dateFormat: DEFAULTS.general.dateFormat,
  });

  // Hydrate barangay info from global Firestore settings
  useEffect(() => {
    if (data) {
      setInfo({
        name:         data.name         ?? DEFAULTS.general.name,
        municipality: data.municipality ?? DEFAULTS.general.municipality,
        province:     data.province     ?? DEFAULTS.general.province,
        zipCode:      data.zipCode      ?? DEFAULTS.general.zipCode,
        email:        data.email        ?? DEFAULTS.general.email,
        phone:        data.phone        ?? DEFAULTS.general.phone,
        captain:      data.captain      ?? DEFAULTS.general.captain,
        version:      data.version      ?? DEFAULTS.general.version,
      });

      // For residents: locale comes from their own profile; fall back to global settings
      if (!readOnly) {
        setLocale({
          timezone:   data.timezone   ?? DEFAULTS.general.timezone,
          language:   data.language   ?? DEFAULTS.general.language,
          dateFormat: data.dateFormat ?? DEFAULTS.general.dateFormat,
        });
      }
    }
  }, [data, readOnly]);

  // For residents: hydrate locale from their personal profile preferences
  useEffect(() => {
    if (readOnly && user?.localization) {
      setLocale({
        timezone:   user.localization.timezone   ?? DEFAULTS.general.timezone,
        language:   user.localization.language   ?? DEFAULTS.general.language,
        dateFormat: user.localization.dateFormat ?? DEFAULTS.general.dateFormat,
      });
    }
  }, [readOnly, user]);

  // Expose save() to Settings.jsx via ref
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (readOnly) {
        // Resident: save localization to their own user profile only
        const userId = user?.uid || user?.id;
        await updateUserProfile(userId, { localization: locale });
        // Keep Redux auth state in sync so changes are reflected immediately
        dispatch(updateUser({ localization: locale }));
      } else {
        // Admin/staff: save everything to global settings
        const payload = { ...info, ...locale };
        await saveMutation.mutateAsync({ data: payload, user });
        // Keep Redux auth state in sync so LanguageContext reflects the change
        // immediately (LanguageContext prioritises user.localization.language over
        // global settings, so without this the admin's own UI never updates).
        dispatch(updateUser({ localization: locale }));
        await addAuditLog({
          action:   `Updated General & Localization settings`,
          category: 'Settings',
          user,
        });
      }
    },
  }), [readOnly, info, locale, saveMutation, user, dispatch]);

  const handleInfo   = (field) => (e) => { if (readOnly) return; setInfo((p)   => ({ ...p, [field]: e.target.value })); onDirty?.(); };
  const handleLocale = (field) => (e) => { setLocale((p) => ({ ...p, [field]: e.target.value })); onDirty?.(); };

  if (isLoading) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError)   return <Alert severity="error">Failed to load general settings.</Alert>;

  return (
    <Stack spacing={2}>
      {/* ── Barangay Information ── */}
      <SettingsSectionCard
        title="🏢 Barangay Information"
        description="Basic details about your barangay shown in documents and reports."
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" label="Barangay Name *"      required={!readOnly} value={info.name}         onChange={handleInfo('name')}         InputProps={{ readOnly }} />
            <TextField fullWidth size="small" label="Municipality / City *" required={!readOnly} value={info.municipality} onChange={handleInfo('municipality')} InputProps={{ readOnly }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" label="Province"  value={info.province} onChange={handleInfo('province')} InputProps={{ readOnly }} />
            <TextField fullWidth size="small" label="Zip Code"  value={info.zipCode}  onChange={handleInfo('zipCode')}  InputProps={{ readOnly }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" type="email" label="Official Contact Email" value={info.email} onChange={handleInfo('email')} InputProps={{ readOnly }} />
            <TextField fullWidth size="small" type="tel"   label="Contact Phone"          value={info.phone} onChange={handleInfo('phone')} InputProps={{ readOnly }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth size="small" label="Barangay Captain" value={info.captain} onChange={handleInfo('captain')} InputProps={{ readOnly }} />
            <TextField fullWidth size="small" label="System Version"   value={info.version} disabled helperText="Managed automatically by the system" />
          </Stack>
        </Stack>
      </SettingsSectionCard>

      {/* ── Localization ── */}
      <SettingsSectionCard
        title="🌏 Localization"
        description={
          readOnly
            ? 'Your personal date, timezone and language preferences.'
            : 'Date formats, timezone and language preferences.'
        }
      >
        <Stack spacing={2}>
          {readOnly && (
            <Typography variant="caption" color="text.secondary">
              These preferences apply only to your account and do not affect other users.
            </Typography>
          )}
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
        </Stack>
      </SettingsSectionCard>
    </Stack>
  );
});

export default GeneralSettingsForm;
