import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Chip, Typography, LinearProgress, Alert, Stack,
} from '@mui/material';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAuditLogs } from '../../hooks/useSettings';
import SettingsSectionCard from './SettingsSectionCard';

const CATEGORY_COLOR = {
  Settings:    'default',
  SLA:         'warning',
  Notifications:'info',
  Users:       'primary',
  Permissions: 'error',
  Appearance:  'secondary',
};

const formatTime = (createdAt) => {
  if (!createdAt) return '—';
  try {
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return format(date, 'yyyy-MM-dd hh:mm a');
  } catch {
    return '—';
  }
};

const AuditLog = () => {
  const [search, setSearch] = useState('');
  const { data = [], isLoading, isError } = useAuditLogs();

  const filtered = data.filter(
    (e) =>
      e.action?.toLowerCase().includes(search.toLowerCase()) ||
      e.userName?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SettingsSectionCard
      title="📋 System Audit Log"
      description="Recent system configuration changes and administrative actions."
      action={
        <TextField
          size="small"
          placeholder="Search logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={14} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 210 }}
        />
      }
    >
      {isLoading && <LinearProgress sx={{ mb: 1, borderRadius: '4px' }} />}
      {isError   && <Alert severity="warning" sx={{ mb: 1 }}>Could not load audit logs from server.</Alert>}

      <TableContainer>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 165, whiteSpace: 'nowrap' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 115 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 145, whiteSpace: 'nowrap' }}>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((entry, idx) => (
              <TableRow key={entry.id ?? idx} hover>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {formatTime(entry.createdAt)}
                </TableCell>
                <TableCell sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>{entry.action}</TableCell>
                <TableCell>
                  <Chip
                    label={entry.category}
                    size="small"
                    color={CATEGORY_COLOR[entry.category] ?? 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.68rem', height: 20 }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {entry.userName}
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'No entries match your search.' : 'No audit log entries yet. Changes will appear here after saving settings.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </SettingsSectionCard>
  );
};

export default AuditLog;
