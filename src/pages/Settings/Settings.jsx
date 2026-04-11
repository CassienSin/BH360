import { useState, useRef, useCallback } from 'react';
import { Box, Tabs, Tab, Button, Stack, Chip, Typography, CircularProgress } from '@mui/material';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

import GeneralSettingsForm  from '../../components/settings/GeneralSettingsForm';
import NotificationSettings from '../../components/settings/NotificationSettings';
import AppearanceSettings   from '../../components/settings/AppearanceSettings';

const TABS = [
  { value: 'general',       label: 'General' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'appearance',    label: 'Appearance' },
];

const Settings = () => {
  const [activeTab,  setActiveTab]  = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [resetKey,   setResetKey]   = useState(0);

  const generalRef       = useRef(null);
  const notificationsRef = useRef(null);
  const appearanceRef    = useRef(null);

  const TAB_REFS = {
    general:       [generalRef],
    notifications: [notificationsRef],
    appearance:    [appearanceRef],
  };

  const handleDirty = useCallback(() => setHasChanges(true), []);

  const handleSave = async () => {
    const refs = Object.values(TAB_REFS).flat();
    if (!refs.length) return;

    setIsSaving(true);
    try {
      await Promise.all(
        refs
          .filter((r) => r.current?.save)
          .map((r) => r.current.save()),
      );
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (err) {
      console.error('[Settings] save error:', err);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setHasChanges(false);
    toast.info('Changes discarded.');
    setResetKey((prev) => prev + 1);
  };

  return (
    <Stack sx={{ height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }, overflow: 'hidden', bgcolor: 'grey.50' }}>
      {/* Tab bar */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 1, sm: 3 },
          flexShrink: 0,
        }}
      >
        <Tabs
          value={TABS.some((t) => t.value === activeTab) ? activeTab : false}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.8125rem',
              py: 1.5,
              minHeight: 46,
              textTransform: 'none',
              fontWeight: 500,
            },
            '& .Mui-selected': { fontWeight: 700 },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Box sx={{ display: activeTab === 'general' ? 'block' : 'none' }}>
            <GeneralSettingsForm key={`general-${resetKey}`} ref={generalRef} onDirty={handleDirty} />
          </Box>
          <Box sx={{ display: activeTab === 'notifications' ? 'block' : 'none' }}>
            <NotificationSettings key={`notifications-${resetKey}`} ref={notificationsRef} onDirty={handleDirty} />
          </Box>
          <Box sx={{ display: activeTab === 'appearance' ? 'block' : 'none' }}>
            <AppearanceSettings key={`appearance-${resetKey}`} ref={appearanceRef} onDirty={handleDirty} />
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 3,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
          gap: 1,
        }}
      >
        {hasChanges ? (
          <Chip
            label="Unsaved changes"
            size="small"
            variant="outlined"
            color="warning"
            sx={{ mr: 'auto' }}
          />
        ) : (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mr: 'auto' }}
          >
            All changes saved
          </Typography>
        )}

        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<RotateCcw size={14} />}
          onClick={handleCancel}
          disabled={isSaving || !hasChanges}
          sx={{ borderRadius: '8px' }}
        >
          Discard
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={isSaving
            ? <CircularProgress size={14} color="inherit" />
            : <Save size={14} />}
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          sx={{ borderRadius: '8px', minWidth: 120 }}
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default Settings;
