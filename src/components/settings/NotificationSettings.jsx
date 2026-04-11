import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Typography, Stack, LinearProgress, Alert,
} from '@mui/material';
import { Mail, Bell } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useNotificationSettings, useSaveNotificationSettings } from '../../hooks/useSettings';
import { addAuditLog, DEFAULTS } from '../../services/settingsService';
import SettingsSectionCard from './SettingsSectionCard';

const EVENTS = [
  { key: 'newIncident',  label: 'New Incident Reported'    },
  { key: 'resolved',     label: 'Incident Resolved'        },
  { key: 'feedback',     label: 'New Feedback Submitted'   },
  { key: 'taskAssigned', label: 'Tanod Task Assigned'      },
  { key: 'announcement', label: 'New Announcement'         },
];

const ROLES = [
  { key: 'captain',   label: 'Brgy. Captain' },
  { key: 'kagawad',   label: 'Kagawad'       },
  { key: 'secretary', label: 'Secretary'     },
  { key: 'tanod',     label: 'Tanod'         },
  { key: 'resident',  label: 'Resident'      },
];

const NotificationSettings = forwardRef(function NotificationSettings({ onDirty }, ref) {
  const { user }         = useAppSelector((s) => s.auth);
  const { data, isLoading, isError } = useNotificationSettings();
  const saveMutation     = useSaveNotificationSettings();

  const [events, setEvents] = useState(DEFAULTS.notifications.events);

  useEffect(() => {
    if (data?.events) setEvents({ ...DEFAULTS.notifications.events, ...data.events });
  }, [data]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      await saveMutation.mutateAsync({ data: { events }, user });
      await addAuditLog({ action: 'Updated Notification Preferences', category: 'Notifications', user });
    },
  }), [events, saveMutation, user]);

  const toggle = (eventKey, role, channel) => {
    setEvents((prev) => ({
      ...prev,
      [eventKey]: {
        ...prev[eventKey],
        [role]: {
          ...prev[eventKey]?.[role],
          [channel]: !prev[eventKey]?.[role]?.[channel],
        },
      },
    }));
    onDirty?.();
  };

  if (isLoading) return <LinearProgress sx={{ borderRadius: '12px' }} />;
  if (isError)   return <Alert severity="error">Failed to load notification settings.</Alert>;

  return (
    <SettingsSectionCard
      title="🔔 Notification Preferences"
      description="Configure per-role email and push notification preferences for each system event."
    >
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: '28%' }}>Event</TableCell>
              {ROLES.map((r) => (
                <TableCell key={r.key} colSpan={2} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', borderLeft: '1px solid', borderColor: 'divider' }}>
                  {r.label}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Channel →</TableCell>
              {ROLES.map((r) => (
                ['email', 'push'].map((ch) => (
                  <TableCell
                    key={`${r.key}-${ch}`}
                    align="center"
                    sx={{
                      fontSize: '0.68rem',
                      color: 'text.secondary',
                      pt: 0.5,
                      borderLeft: ch === 'email' ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      {ch === 'email'
                        ? <Mail size={11} />
                        : <Bell size={11} />}
                      <span>{ch === 'email' ? 'Email' : 'Push'}</span>
                    </Stack>
                  </TableCell>
                ))
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {EVENTS.map((ev) => (
              <TableRow key={ev.key} hover>
                <TableCell sx={{ fontSize: '0.8125rem', color: 'text.primary', py: 0.5 }}>
                  {ev.label}
                </TableCell>
                {ROLES.map((r) => (
                  ['email', 'push'].map((ch) => (
                    <TableCell
                      key={`${r.key}-${ch}`}
                      align="center"
                      sx={{ py: 0.5, borderLeft: ch === 'email' ? '1px solid' : 'none', borderColor: 'divider' }}
                    >
                      <Checkbox
                        size="small"
                        checked={!!events[ev.key]?.[r.key]?.[ch]}
                        onChange={() => toggle(ev.key, r.key, ch)}
                        sx={{ p: 0.5 }}
                      />
                    </TableCell>
                  ))
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        ✉️ Email = email notification sent &nbsp;|&nbsp; 🔔 Push = in-app push notification
      </Typography>
    </SettingsSectionCard>
  );
});

export default NotificationSettings;
