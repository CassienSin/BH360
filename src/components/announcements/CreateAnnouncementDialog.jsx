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
} from '@mui/material';
import { X, Bell, AlertTriangle, Info } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { addAnnouncement } from '../../store/slices/announcementSlice';
import { toast } from 'react-toastify';

const CreateAnnouncementDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    dispatch(
      addAnnouncement({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        date: new Date(),
        createdBy: 'Admin',
      })
    );

    toast.success('Announcement created successfully!');
    setFormData({ title: '', message: '', type: 'info' });
    onClose();
  };

  const handleClose = () => {
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
          <IconButton onClick={handleClose} size="small">
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
            />

            <TextField
              select
              label="Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
              fullWidth
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
            />

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
                  <Typography variant="body2" color="text.secondary">
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
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create Announcement
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateAnnouncementDialog;
