import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stack, Typography, TextField, Box, Chip, LinearProgress, Alert } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { useSLASettings, useSaveSLASettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import SettingsSectionCard from './SettingsSectionCard';

const SLAConfiguration = forwardRef(function SLAConfiguration(
  { preview = false, onSwitchTab, onDirty },
  ref,
) {
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = useSLASettings();
  const saveMutation = useSaveSLASettings();

  const [thresholds, setThresholds] = useState(DEFAULTS.sla);

  useEffect(() => {
    if (data?.thresholds?.length) setThresholds(data.thresholds);
  }, [data]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      await saveMutation.mutateAsync({ data: { thresholds }, user });
      await addAuditLog({ action: 'Updated Incident SLA Thresholds', category: 'SLA', user });
    },
  }), [thresholds, saveMutation, user]);

  const handleChange = (key, value) => {
    setThresholds((prev) => prev.map((t) => (t.key === key ? { ...t, value: Number(value) } : t)));
    onDirty?.();
  };

  if (isLoading && !preview) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError   && !preview) return <Alert severity="error">Failed to load SLA settings.</Alert>;

  const title       = '⏱ Incident SLA Thresholds';
  const description = preview
    ? '[Available in Incident SLA tab] — Response time targets by priority level.'
    : 'Define response time targets and escalation thresholds by incident priority.';

  return (
    <SettingsSectionCard
      title={title}
      description={description}
      preview={preview}
      onSwitchTab={onSwitchTab}
    >
      <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'grey.100' }} />}>
        {thresholds.map((item) => (
          <Stack key={item.key} direction="row" alignItems="center" sx={{ py: 1.5 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {item.label}
                </Typography>
                <Chip
                  label={item.color.charAt(0).toUpperCase() + item.color.slice(1)}
                  size="small"
                  color={item.color}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
            </Box>

            <TextField
              size="small"
              type="number"
              value={item.value}
              onChange={(e) => handleChange(item.key, e.target.value)}
              sx={{ width: 80 }}
              inputProps={{ min: 1, style: { textAlign: 'center' } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5, whiteSpace: 'nowrap', minWidth: 50 }}>
              {item.unit}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </SettingsSectionCard>
  );
});

export default SLAConfiguration;
