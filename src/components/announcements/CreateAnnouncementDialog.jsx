import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  useTheme,
  Box,
  Typography,
  alpha,
  CircularProgress,
} from '@mui/material';
import { X, Bell, AlertTriangle, Info } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useCreateAnnouncement } from '../../hooks/useAnnouncements';

const CreateAnnouncementDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const createAnnouncementMutation = useCreateAnnouncement();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      return;
    }

    await createAnnouncementMutation.mutateAsync({
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
      status: 'published',
      // Issue #10: Prefer firstName + lastName over raw email for poster identity
      createdBy: user?.firstName
        ? `${user.firstName} ${user.lastName}`.trim()
        : user?.displayName || 'Admin',
      createdById: user?.uid || null,
    });

    setFormData({ title: '', message: '', type: 'info' });
    onClose();
  };

  const handleClose = () => {
    if (createAnnouncementMutation.isPending) return;
    setFormData({ title: '', message: '', type: 'info' });
    onClose();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} color={theme.palette.warning.main} />;
      case 'urgent':
        return <AlertTriangle size={20} color={theme.palette.error.main} />;
      case 'info':
      default:
        return <Info size={20} color={theme.palette.info.main} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning':
        return theme.palette.warning.main;
      case 'urgent':
        return theme.palette.error.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  const isPending = createAnnouncementMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Bell size={24} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Create Announcement
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small" disabled={isPending}>
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Announcement Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
              placeholder="e.g., Community Event, Important Notice"
              disabled={isPending}
            />

            <TextField
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              fullWidth
              disabled={isPending}
            >
              <MenuItem value="info">
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getTypeIcon('info')}
                  <Typography>Information</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="warning">
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getTypeIcon('warning')}
                  <Typography>Warning</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="urgent">
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getTypeIcon('urgent')}
                  <Typography>Urgent</Typography>
                </Stack>
              </MenuItem>
            </TextField>

            <TextField
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Provide detailed information about the announcement..."
              disabled={isPending}
            />

            {/* Live Preview */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(getTypeColor(formData.type), 0.05),
                border: `1px solid ${alpha(getTypeColor(formData.type), 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="start">
                {getTypeIcon(formData.type)}
                <Stack spacing={0.5} flex={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Preview
                  </Typography>
                  <Typography variant="body2" color={formData.title ? 'text.primary' : 'text.secondary'}>
                    {formData.title || 'Your announcement title will appear here'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.message || 'Your message will appear here'}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || !formData.title.trim() || !formData.message.trim()}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isPending ? 'Publishing...' : 'Publish Announcement'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateAnnouncementDialog;
