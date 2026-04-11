import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stack, Box, Typography, Switch, Chip, LinearProgress, Alert } from '@mui/material';
import { Check } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useAppearanceSettings, useSaveAppearanceSettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import { COLOR_SCHEMES } from '../../theme/theme';
import SettingsSectionCard from './SettingsSectionCard';

const AppearanceSettings = forwardRef(function AppearanceSettings({ onDirty }, ref) {
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = useAppearanceSettings();
  const saveMutation = useSaveAppearanceSettings();

  const [state, setState] = useState(DEFAULTS.appearance);

  useEffect(() => {
    if (data) setState({ ...DEFAULTS.appearance, ...data });
  }, [data]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      await saveMutation.mutateAsync({ data: state, user });
      await addAuditLog({ action: 'Updated Appearance & Theme settings', category: 'Appearance', user });
    },
  }), [state, saveMutation, user]);

  const set = (field, value) => { setState((p) => ({ ...p, [field]: value })); onDirty?.(); };

  if (isLoading) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError)   return <Alert severity="error">Failed to load appearance settings.</Alert>;

  return (
    <Stack spacing={2}>
      <SettingsSectionCard
        title="🎨 Theme & Color Scheme"
        description="Customize the visual appearance of the BH360 system."
      >
        <Stack spacing={3}>
          {/* Color scheme picker */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Color Scheme
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {COLOR_SCHEMES.map((scheme, idx) => {
                const isSelected = state.colorScheme === idx;
                return (
                  <Box
                    key={scheme.name}
                    onClick={() => set('colorScheme', idx)}
                    sx={{
                      p: 1.5, borderRadius: '10px', border: 2,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 170,
                      bgcolor: isSelected ? 'rgba(99,102,241,0.04)' : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(99,102,241,0.04)' },
                    }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: scheme.primary, boxShadow: 1 }} />
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: scheme.secondary, boxShadow: 1 }} />
                    </Stack>
                    <Typography variant="caption" fontWeight={isSelected ? 700 : 500} color={isSelected ? 'primary.main' : 'text.primary'} sx={{ flex: 1 }}>
                      {scheme.name}
                    </Typography>
                    {isSelected && <Check size={14} color="#6366F1" strokeWidth={2.5} />}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Display toggles */}
          <Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.25, borderBottom: 1, borderColor: 'grey.100' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>Dark Mode</Typography>
                <Typography variant="caption" color="text.secondary">Switch to dark theme (coming soon)</Typography>
              </Box>
              <Switch checked={!!state.darkMode} onChange={(e) => set('darkMode', e.target.checked)} disabled size="small" />
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.25 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>Compact Mode</Typography>
                <Typography variant="caption" color="text.secondary">Reduce spacing for denser information display</Typography>
              </Box>
              <Switch checked={!!state.compactMode} onChange={(e) => set('compactMode', e.target.checked)} color="primary" size="small" />
            </Stack>
          </Stack>
        </Stack>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="🖼️ Branding"
        description="Customize logos and imagery shown in reports and documents."
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Logo customization and branding features will be available in a future update.
          </Typography>
          <Chip label="Coming Soon" size="small" variant="outlined" color="primary" sx={{ alignSelf: 'flex-start' }} />
        </Stack>
      </SettingsSectionCard>
    </Stack>
  );
});

export default AppearanceSettings;
