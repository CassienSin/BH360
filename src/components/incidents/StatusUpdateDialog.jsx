import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Chip,
  alpha,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useUpdateIncident } from '../../hooks/useIncidents';
import { useAppSelector } from '../../store/hooks';

const StatusUpdateDialog = ({ open, onClose, incident }) => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [status, setStatus] = useState(incident?.status || 'submitted');
  const [notes, setNotes] = useState('');

  const updateIncidentMutation = useUpdateIncident();

  const statusOptions = [
    { value: 'submitted', label: 'Submitted', icon: <AlertCircle size={16} />, color: theme.palette.info.main },
    { value: 'in-progress', label: 'In Progress', icon: <Clock size={16} />, color: theme.palette.warning.main },
    { value: 'resolved', label: 'Resolved', icon: <CheckCircle2 size={16} />, color: theme.palette.success.main },
    { value: 'rejected', label: 'Rejected', icon: <XCircle size={16} />, color: theme.palette.error.main },
  ];

  const handleSubmit = async () => {
    await updateIncidentMutation.mutateAsync({
      incidentId: incident.id,
      updates: {
        status,
        notes: notes || undefined,
        updatedBy: user?.uid || user?.email || 'Admin',
        ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
      },
    });
    onClose();
  };

  const currentStatusColor =
    statusOptions.find((s) => s.value === status)?.color || theme.palette.grey[500];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Update Incident Status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Case #{incident?.id?.substring(0, 8)}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={2}>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {option.icon}
                  <Typography>{option.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Update Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={4}
            fullWidth
            placeholder="Add notes about this status update..."
          />

          {status !== incident?.status && (
            <Stack
              p={2}
              sx={{
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" fontWeight={600} mb={1}>
                Status Change
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={incident?.status?.replace('-', ' ')}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Typography variant="body2">→</Typography>
                <Chip
                  label={status.replace('-', ' ')}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    backgroundColor: alpha(currentStatusColor, 0.1),
                    color: currentStatusColor,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" disabled={updateIncidentMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={updateIncidentMutation.isPending}
          startIcon={updateIncidentMutation.isPending ? <CircularProgress size={16} /> : undefined}
        >
          {updateIncidentMutation.isPending ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;
