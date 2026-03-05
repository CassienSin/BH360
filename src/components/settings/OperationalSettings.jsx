import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stack, Switch, Typography, TextField, Box, Divider, LinearProgress, Alert } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { useOperationalSettings, useSaveOperationalSettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import SettingsSectionCard from './SettingsSectionCard';

const TOGGLES = [
  { key: 'selfRegistration',   label: 'Resident Self-Registration',   desc: 'Allow residents to sign up without admin invite' },
  { key: 'aiHelpDesk',         label: 'AI Help Desk',                 desc: 'Enable the AI-powered chatbot for resident queries' },
  { key: 'communityFeedback',  label: 'Community Feedback Portal',    desc: 'Allow residents to submit and view feedback' },
  { key: 'publicIncidentMap',  label: 'Public Incident Map',          desc: 'Show anonymized incidents on the resident map view' },
  { key: 'emailNotifications', label: 'Email Notifications',          desc: 'Send email alerts for new incidents and updates' },
];

const NUMERIC = [
  { key: 'incidentsPerPage', label: 'Incidents Per Page',         hint: 'Affects table pagination in incident list', min: 5,  max: 100 },
  { key: 'mapZoomLevel',     label: 'Default Map Zoom Level',     hint: 'Leaflet zoom (1–18), 14 = street level',    min: 1,  max: 18  },
  { key: 'sessionTimeout',   label: 'Session Timeout (minutes)',  hint: 'Auto-logout after inactivity',             min: 5,  max: 480 },
];

const OperationalSettings = forwardRef(function OperationalSettings({ onDirty }, ref) {
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = useOperationalSettings();
  const saveMutation = useSaveOperationalSettings();

  const [state, setState] = useState(DEFAULTS.operational);

  useEffect(() => {
    if (data) setState({ ...DEFAULTS.operational, ...data });
  }, [data]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      await saveMutation.mutateAsync({ data: state, user });
      await addAuditLog({
        action:   `Updated Operational Settings`,
        category: 'Settings',
        user,
      });
    },
  }), [state, saveMutation, user]);

  const handleToggle  = (key, value) => { setState((p) => ({ ...p, [key]: value })); onDirty?.(); };
  const handleNumeric = (key) => (e)  => { setState((p) => ({ ...p, [key]: Number(e.target.value) })); onDirty?.(); };

  if (isLoading) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError)   return <Alert severity="error">Failed to load operational settings.</Alert>;

  return (
    <SettingsSectionCard
      title="🔧 Operational Settings"
      description="Feature toggles and system behavior configuration."
    >
      <Stack>
        {TOGGLES.map((t, idx) => (
          <Stack
            key={t.key}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1.25, borderBottom: idx < TOGGLES.length - 1 ? 1 : 0, borderColor: 'grey.100' }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">{t.label}</Typography>
              <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
            </Box>
            <Switch
              checked={!!state[t.key]}
              onChange={(e) => handleToggle(t.key, e.target.checked)}
              color="primary"
              size="small"
            />
          </Stack>
        ))}

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
          {NUMERIC.map((f) => (
            <TextField
              key={f.key}
              size="small"
              type="number"
              label={f.label}
              value={state[f.key] ?? ''}
              onChange={handleNumeric(f.key)}
              helperText={f.hint}
              sx={{ width: { xs: '100%', sm: 210 } }}
              inputProps={{ min: f.min, max: f.max }}
            />
          ))}
        </Stack>
      </Stack>
    </SettingsSectionCard>
  );
});

export default OperationalSettings;
