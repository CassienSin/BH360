import { useState, useEffect } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  alpha,
  useTheme,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Bell, AlertTriangle, Info, Plus, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import { useAllAnnouncements, useDeleteAnnouncement } from '../../hooks/useAnnouncements';
import { useAllUsers } from '../../hooks/useUsers';
import CreateAnnouncementDialog from '../../components/announcements/CreateAnnouncementDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Announcements = () => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Issue #19: Replace window.confirm with MUI ConfirmDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const isAdmin = user?.role === 'admin';

  const { data: announcements = [], isLoading, error, refetch } = useAllAnnouncements();
  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const { data: allUsers = [] } = useAllUsers();

  // Build uid → full name lookup from the users list
  const userNameMap = allUsers.reduce((acc, u) => {
    if (u.id || u.uid) {
      const key = u.id || u.uid;
      acc[key] = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.displayName || null;
    }
    return acc;
  }, {});

  // Resolve poster name: prefer uid lookup → stored name field → strip email domain
  const resolvePoster = (createdById, createdBy) => {
    if (createdById && userNameMap[createdById]) return userNameMap[createdById];
    if (!createdBy) return null;
    if (createdBy.includes('@')) return createdBy.split('@')[0];
    return createdBy;
  };

  // Issue #23: Update document title
  useEffect(() => {
    document.title = 'Announcements – BH360';
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'urgent':
        return <AlertTriangle size={24} />;
      case 'info':
      default:
        return <Info size={24} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'urgent': return 'error';
      case 'info':
      default: return 'info';
    }
  };

  const getAccentColor = (type) => {
    switch (type) {
      case 'warning': return theme.palette.warning.main;
      case 'urgent': return theme.palette.error.main;
      case 'info':
      default: return theme.palette.info.main;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy • HH:mm');
    } catch {
      return '';
    }
  };

  const handleDeleteClick = (id) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (announcementToDelete) {
      deleteAnnouncementMutation.mutate(announcementToDelete);
    }
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  if (isLoading) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Stack spacing={1}>
          {/* Issue #6: component="h1" */}
          <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest updates and announcements from the barangay
          </Typography>
        </Stack>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
            Announcements
          </Typography>
        </Stack>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" startIcon={<RefreshCw size={16} />} onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load announcements. Please check your connection and try again.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest updates and announcements from the barangay
            {announcements.length > 0 && ` • ${announcements.length} total`}
          </Typography>
        </Stack>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.3)', flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Create Announcement</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Create</Box>
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
          announcements.map((announcement, index) => {
            const accentColor = getAccentColor(announcement.type);
            const poster = resolvePoster(announcement.createdById, announcement.createdBy);
            return (
              <Card
                key={announcement.id}
                className="glass hover-lift"
                elevation={0}
                sx={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.07}s both`,
                  border: `1px solid ${alpha(accentColor, 0.2)}`,
                  borderLeft: `4px solid ${accentColor}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(accentColor, 0.1),
                        color: accentColor,
                        height: 'fit-content',
                        flexShrink: 0,
                      }}
                    >
                      {getIcon(announcement.type)}
                    </Box>
                    <Stack spacing={1} flexGrow={1} minWidth={0}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1}>
                        <Typography variant="h6" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                          {announcement.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                          <Chip
                            label={announcement.type}
                            size="small"
                            color={getTypeColor(announcement.type)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                          {isAdmin && (
                            <Tooltip title="Delete announcement">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(announcement.id)}
                                disabled={deleteAnnouncementMutation.isPending}
                                aria-label={`Delete announcement: ${announcement.title}`}
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  },
                                }}
                              >
                                {deleteAnnouncementMutation.isPending ? (
                                  <CircularProgress size={16} color="error" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {announcement.message}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(announcement.createdAt)}
                        </Typography>
                        {/* Issue #10: Show display name, not raw email */}
                        {poster && (
                          <Typography variant="caption" color="text.secondary">
                            Posted by <strong>{poster}</strong>
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      {openCreateDialog && (
        <CreateAnnouncementDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
        />
      )}

      {/* Issue #19: MUI confirm dialog instead of window.confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setAnnouncementToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteAnnouncementMutation.isPending}
      />
    </Stack>
  );
};

export default Announcements;
