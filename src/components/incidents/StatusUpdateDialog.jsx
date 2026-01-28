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
  useTheme,
} from '@mui/material';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const StatusUpdateDialog = ({ open, onClose, incident, onUpdate }) => {
  const theme = useTheme();
  const [status, setStatus] = useState(incident?.status || 'submitted');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState(incident?.assignedTo || '');

  const statusOptions = [
    { value: 'submitted', label: 'Submitted', icon: <AlertCircle size={16} />, color: theme.palette.info.main },
    { value: 'in-progress', label: 'In Progress', icon: <Clock size={16} />, color: theme.palette.warning.main },
    { value: 'resolved', label: 'Resolved', icon: <CheckCircle2 size={16} />, color: theme.palette.success.main },
  ];

  const tanodMembers = [
    'Tanod Pedro Santos',
    'Tanod Jose Cruz',
    'Tanod Maria Garcia',
    'Tanod Juan Reyes',
  ];

  const handleSubmit = () => {
    const updateData = {
      status,
      notes,
      assignedTo: assignedTo || null,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User', // Replace with actual user
    };

    onUpdate(updateData);
    toast.success('Incident status updated successfully');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Update Incident Status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Case #{incident?.id}
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
            select
            label="Assign To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            fullWidth
            helperText="Optional: Assign a Tanod member to this incident"
          >
            <MenuItem value="">
              <em>Unassigned</em>
            </MenuItem>
            {tanodMembers.map((member) => (
              <MenuItem key={member} value={member}>
                {member}
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
                    backgroundColor: alpha(
                      statusOptions.find((s) => s.value === status)?.color || theme.palette.grey[500],
                      0.1
                    ),
                    color: statusOptions.find((s) => s.value === status)?.color,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;
