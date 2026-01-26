import { useState } from 'react';
import { Stack, Typography, Card, CardContent, Box, Chip, alpha, useTheme, Button, IconButton } from '@mui/material';
import { Bell, AlertTriangle, Info, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { deleteAnnouncement } from '../../store/slices/announcementSlice';
import CreateAnnouncementDialog from '../../components/announcements/CreateAnnouncementDialog';
import { toast } from 'react-toastify';

const Announcements = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { announcements } = useAppSelector((state) => state.announcement);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const isAdmin = user?.role === 'admin';

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'urgent':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  const getTypeColor = (type: string): 'warning' | 'info' | 'error' => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'urgent':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      dispatch(deleteAnnouncement(id));
      toast.success('Announcement deleted successfully');
    }
  };

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest updates and announcements from the barangay
          </Typography>
        </Stack>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            Create Announcement
          </Button>
        )}
      </Stack>

      <Stack spacing={2}>
        {announcements.length === 0 ? (
          <Card className="glass">
            <CardContent>
              <Stack alignItems="center" spacing={2} py={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                  }}
                >
                  <Bell size={48} color={theme.palette.text.secondary} />
                </Box>
                <Typography variant="h6" color="text.secondary">
                  No announcements yet
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {isAdmin
                    ? 'Create your first announcement to keep residents informed'
                    : 'Check back later for updates from the barangay'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement, index) => (
            <Card
              key={announcement.id}
              className="glass hover-lift"
              sx={{
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(
                        announcement.type === 'warning'
                          ? theme.palette.warning.main
                          : announcement.type === 'urgent'
                          ? theme.palette.error.main
                          : theme.palette.info.main,
                        0.1
                      ),
                      height: 'fit-content',
                    }}
                  >
                    {getIcon(announcement.type)}
                  </Box>
                  <Stack spacing={1} flexGrow={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Typography variant="h6" fontWeight={600}>
                        {announcement.title}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={announcement.type}
                          size="small"
                          color={getTypeColor(announcement.type)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(announcement.id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {announcement.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(announcement.date), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      <CreateAnnouncementDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      />
    </Stack>
  );
};

export default Announcements;
