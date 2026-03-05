import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Typography, LinearProgress, Alert, Tooltip,
} from '@mui/material';
import { Check, Minus, Lock } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { usePermissionsSettings, useSavePermissionsSettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import SettingsSectionCard from './SettingsSectionCard';

export const FEATURE_LABELS = {
  viewDashboard:    'View Dashboard',
  createIncident:   'Create Incident',
  manageIncidents:  'Manage Incidents',
  assignTanod:      'Assign Tanod',
  userManagement:   'User Management',
  viewAnalytics:    'View Analytics',
  tanodManagement:  'Tanod Management',
  systemSettings:   'System Settings',
  aiHelpDesk:       'AI Help Desk',
  announcements:    'Announcements',
  ticketManagement: 'Ticket Management',
};

const ROLES = [
  { key: 'admin',    label: 'Admin',    locked: true  },   // Admin always has all perms
  { key: 'staff',    label: 'Staff',    locked: false },
  { key: 'tanod',    label: 'Tanod',    locked: false },
  { key: 'resident', label: 'Resident', locked: false },
];

const RolesPermissionsMatrix = forwardRef(function RolesPermissionsMatrix(
  { preview = false, onSwitchTab, onDirty },
  ref,
) {
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = usePermissionsSettings();
  const saveMutation = useSavePermissionsSettings();

  const [perms, setPerms] = useState(DEFAULTS.permissions);

  useEffect(() => {
    if (data) setPerms({ ...DEFAULTS.permissions, ...data });
  }, [data]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      await saveMutation.mutateAsync({ data: perms, user });
      await addAuditLog({ action: 'Updated Roles & Permissions Matrix', category: 'Permissions', user });
    },
  }), [perms, saveMutation, user]);

  const toggle = (feature, role) => {
    setPerms((prev) => ({
      ...prev,
      [feature]: { ...prev[feature], [role]: !prev[feature]?.[role] },
    }));
    onDirty?.();
  };

  if (isLoading && !preview) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError   && !preview) return <Alert severity="error">Failed to load permissions.</Alert>;

  /* ── Preview (read-only, General tab) ── */
  if (preview) {
    return (
      <SettingsSectionCard
        title="🔐 Roles & Permissions Matrix"
        description="[Available in Roles & Permissions tab] — Feature access control per user role."
        preview
        onSwitchTab={onSwitchTab}
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: '35%' }}>Feature / Permission</TableCell>
                {ROLES.map((r) => (
                  <TableCell key={r.key} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{r.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(FEATURE_LABELS).map((feat, idx) => (
                <TableRow key={feat} hover sx={{ bgcolor: idx % 2 !== 0 ? 'grey.50' : 'transparent' }}>
                  <TableCell sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>{FEATURE_LABELS[feat]}</TableCell>
                  {ROLES.map((r) => (
                    <TableCell key={r.key} align="center" sx={{ py: 1 }}>
                      {perms[feat]?.[r.key]
                        ? <Check size={15} color="#10B981" strokeWidth={2.5} />
                        : <Minus size={15} color="#CBD5E1" strokeWidth={2} />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SettingsSectionCard>
    );
  }

  /* ── Full editable matrix (Roles tab) ── */
  return (
    <SettingsSectionCard
      title="🔐 Roles & Permissions Matrix"
      description="Define which features each user role can access. Admin permissions are fixed and cannot be changed."
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: '38%' }}>Feature / Permission</TableCell>
              {ROLES.map((r) => (
                <TableCell key={r.key} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                    {r.locked && <Lock size={11} color="#94A3B8" />}
                    <span>{r.label}</span>
                  </Stack>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.keys(FEATURE_LABELS).map((feat, idx) => (
              <TableRow key={feat} hover sx={{ bgcolor: idx % 2 !== 0 ? 'grey.50' : 'transparent' }}>
                <TableCell sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>
                  {FEATURE_LABELS[feat]}
                </TableCell>

                {ROLES.map((r) => (
                  <TableCell key={r.key} align="center" sx={{ py: 0.5 }}>
                    {r.locked ? (
                      <Tooltip title="Admin always has full access" arrow>
                        <span>
                          <Checkbox size="small" checked disabled sx={{ p: 0.5, color: '#10B981', '&.Mui-disabled': { color: '#10B981' } }} />
                        </span>
                      </Tooltip>
                    ) : (
                      <Checkbox
                        size="small"
                        checked={!!perms[feat]?.[r.key]}
                        onChange={() => toggle(feat, r.key)}
                        color="primary"
                        sx={{ p: 0.5 }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        🔒 Admin column is locked — Admins always have access to all features.
      </Typography>
    </SettingsSectionCard>
  );
});

export default RolesPermissionsMatrix;
