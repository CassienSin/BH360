import { useState, useRef, useCallback } from 'react';
import { Box, Tabs, Tab, Button, Stack, Chip, Typography, CircularProgress } from '@mui/material';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../store/hooks';

import SettingsNav              from '../../components/settings/SettingsNav';
import GeneralSettingsForm      from '../../components/settings/GeneralSettingsForm';
import OperationalSettings      from '../../components/settings/OperationalSettings';
import NotificationSettings     from '../../components/settings/NotificationSettings';
import RolesPermissionsMatrix   from '../../components/settings/RolesPermissionsMatrix';
import SLAConfiguration         from '../../components/settings/SLAConfiguration';
import AppearanceSettings       from '../../components/settings/AppearanceSettings';
import AuditLog                 from '../../components/settings/AuditLog';

const ALL_TABS = [
  { value: 'general',       label: 'General Settings',   roles: ['admin', 'staff', 'resident'] },
  { value: 'notifications', label: 'Notifications',      roles: ['admin', 'staff'] },
  { value: 'roles',         label: 'Roles & Permissions',roles: ['admin'] },
  { value: 'sla',           label: 'Incident SLA',       roles: ['admin', 'staff'] },
  { value: 'appearance',    label: 'Appearance',         roles: ['admin', 'staff'] },
  { value: 'audit',         label: 'Audit Log',          roles: ['admin', 'staff'] },
];

const Settings = () => {
  const { user } = useAppSelector((s) => s.auth);
  const userRole  = user?.role ?? 'resident';
  const isResident = userRole === 'resident';

  // Filter tabs visible to this role
  const TABS = ALL_TABS.filter((t) => t.roles.includes(userRole));

  const [activeTab,  setActiveTab]  = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);

  // ── Refs for each saveable child ─────────────────────────────────────────
  const generalRef       = useRef(null);
  const operationalRef   = useRef(null);
  const notificationsRef = useRef(null);
  const rolesRef         = useRef(null);
  const slaRef           = useRef(null);
  const appearanceRef    = useRef(null);

  // Map tab → refs that should be saved on that tab
  // Residents only have generalRef on the general tab (no operationalRef rendered)
  const TAB_REFS = {
    general:       isResident ? [generalRef] : [generalRef, operationalRef],
    notifications: [notificationsRef],
    roles:         [rolesRef],
    sla:           [slaRef],
    appearance:    [appearanceRef],
  };

  const handleDirty = useCallback(() => setHasChanges(true), []);

  const handleSave = async () => {
    const refs = TAB_REFS[activeTab] ?? [];
    if (!refs.length) return;

    setIsSaving(true);
    try {
      // Call save() on each ref in parallel
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
    // Reload by hard-resetting dirty flag; data will re-hydrate from query cache
    setHasChanges(false);
    toast.info('Changes discarded.');
    // Trigger a re-mount of the active panel by briefly switching tabs then back
    const current = activeTab;
    setActiveTab('__reset__');
    setTimeout(() => setActiveTab(current), 0);
  };

  const showFooter = activeTab !== 'audit';

  return (
    <Box
      sx={{
        display: 'flex',
        height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
        overflow: 'hidden',
        bgcolor: 'grey.50',
      }}
    >
      {/* ══ Left Settings Nav ══ */}
      <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ══ Right Content Area ══ */}
      <Stack sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>

        {/* ── Tab bar ── */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: { xs: 1, sm: 2 },
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

        {/* ── Scrollable content ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>

            {/* General Settings tab — shows General Info + Operational + previews */}
            {activeTab === 'general' && (
              <>
                <GeneralSettingsForm
                  ref={generalRef}
                  onDirty={handleDirty}
                  readOnly={isResident}
                />
                {!isResident && (
                  <>
                    <OperationalSettings
                      ref={operationalRef}
                      onDirty={handleDirty}
                    />
                    <NotificationSettings
                      preview
                      onSwitchTab={() => setActiveTab('notifications')}
                    />
                    <RolesPermissionsMatrix
                      preview
                      onSwitchTab={() => setActiveTab('roles')}
                    />
                    <SLAConfiguration
                      preview
                      onSwitchTab={() => setActiveTab('sla')}
                    />
                  </>
                )}
              </>
            )}

            {activeTab === 'notifications' && (
              <NotificationSettings ref={notificationsRef} onDirty={handleDirty} />
            )}
            {activeTab === 'roles' && (
              <RolesPermissionsMatrix ref={rolesRef} onDirty={handleDirty} />
            )}
            {activeTab === 'sla' && (
              <SLAConfiguration ref={slaRef} onDirty={handleDirty} />
            )}
            {activeTab === 'appearance' && (
              <AppearanceSettings ref={appearanceRef} onDirty={handleDirty} />
            )}
            {activeTab === 'audit' && <AuditLog />}

          </Stack>
        </Box>

        {/* ── Footer ── */}
        {showFooter && (
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
        )}
      </Stack>
    </Box>
  );
};

export default Settings;
