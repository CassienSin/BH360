import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable confirmation dialog — replaces window.confirm() throughout the app.
 * Props:
 *   open          boolean
 *   onClose       () => void   — called on Cancel / backdrop click
 *   onConfirm     () => void   — called on the destructive action button
 *   title         string
 *   message       string
 *   confirmLabel  string  (default: 'Delete')
 *   confirmColor  'error' | 'warning' | 'primary'  (default: 'error')
 *   loading       boolean  — disables buttons while an async action is in flight
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Delete',
  confirmColor = 'error',
  loading = false,
}) => {
  const theme = useTheme();
  const iconColor =
    confirmColor === 'error'
      ? theme.palette.error.main
      : confirmColor === 'warning'
      ? theme.palette.warning.main
      : theme.palette.primary.main;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: alpha(iconColor, 0.1),
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} color={iconColor} />
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose} disabled={loading} aria-label="Close dialog">
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading} fullWidth>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Processing…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
