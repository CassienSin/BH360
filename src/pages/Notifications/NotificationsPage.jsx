import { useState } from 'react';
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Box,
  useTheme,
  alpha,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowLeft,
  Bell,
  Ticket,
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { markAsRead, markAllAsRead, clearNotifications } from '../../store/slices/notificationSlice';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);

  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterReadStatus, setFilterReadStatus] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filter notifications
  const userNotifications = notifications.filter((n) => n.userId === user?.id);

  const filteredNotifications = userNotifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchText.toLowerCase()) ||
      n.message.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;

    const matchesReadStatus =
      filterReadStatus === 'all' ||
      (filterReadStatus === 'unread' && !n.read) ||
      (filterReadStatus === 'read' && n.read);

    return matchesSearch && matchesCategory && matchesReadStatus;
  });

  const getIcon = (category) => {
    switch (category) {
      case 'ticket':
        return <Ticket size={20} />;
      case 'announcement':
        return <Bell size={20} />;
      case 'incident':
        return <AlertCircle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setDetailsOpen(true);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      dispatch(clearNotifications());
    }
  };

  const handleNavigateToLink = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight={700} sx={{ flex: 1 }}>
          Notifications
        </Typography>
        <Chip
          label={`${unreadCount} unread`}
          color="error"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {/* Filters */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search notifications..."
                startAdornment={<Search size={18} style={{ marginRight: 8 }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="incident">Incidents</MenuItem>
                <MenuItem value="announcement">Announcements</MenuItem>
                <MenuItem value="ticket">Tickets</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={filterReadStatus}
                onChange={(e) => setFilterReadStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                {unreadCount > 0 && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<CheckCheck size={16} />}
                    onClick={() => dispatch(markAllAsRead())}
                  >
                    Mark all read
                  </Button>
                )}
                {userNotifications.length > 0 && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={handleClearAll}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                mb: 2,
              }}
            >
              <Bell size={48} color={theme.palette.text.secondary} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchText || filterCategory !== 'all' || filterReadStatus !== 'all'
                ? 'No notifications match your filters'
                : 'No notifications yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchText || filterCategory !== 'all' || filterReadStatus !== 'all'
                ? 'Try adjusting your search criteria'
                : 'You\'ll be notified when there are updates'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `2px solid ${
                  notification.read ? theme.palette.divider : theme.palette.primary.main
                }`,
                backgroundColor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  backgroundColor: notification.read
                    ? alpha(theme.palette.grey[500], 0.04)
                    : alpha(theme.palette.primary.main, 0.08),
                },
              }}
              onClick={() => handleViewDetails(notification)}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  {/* Icon */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(getTypeColor(notification.type), 0.1),
                      color: getTypeColor(notification.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(notification.category)}
                  </Box>

                  {/* Content */}
                  <Stack spacing={0.75} flex={1} minWidth={0}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography
                        variant="subtitle2"
                        fontWeight={notification.read ? 500 : 700}
                        sx={{ flex: 1 }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.category}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', height: 20 }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notification.message}
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {notification.createdAt
                          ? format(
                              notification.createdAt?.toDate
                                ? notification.createdAt.toDate()
                                : new Date(notification.createdAt),
                              'MMM dd, yyyy HH:mm'
                            )
                          : ''}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>

                  {/* Actions */}
                  <Stack direction="column" spacing={0.5}>
                    {notification.link && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToLink(notification);
                        }}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        View
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        {selectedNotification && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: alpha(getTypeColor(selectedNotification.type), 0.1),
                    color: getTypeColor(selectedNotification.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getIcon(selectedNotification.category)}
                </Box>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {selectedNotification.title}
                </Typography>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={2} sx={{ pt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Category
                  </Typography>
                  <Chip
                    label={selectedNotification.category}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                    Message
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedNotification.message}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Received
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.createdAt
                      ? format(
                          selectedNotification.createdAt?.toDate
                            ? selectedNotification.createdAt.toDate()
                            : new Date(selectedNotification.createdAt),
                          'MMMM dd, yyyy HH:mm:ss'
                        )
                      : ''}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              {selectedNotification.link && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleNavigateToLink(selectedNotification);
                    setDetailsOpen(false);
                  }}
                >
                  Go to {selectedNotification.category}
                </Button>
              )}
              <Button variant="outlined" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
};

export default NotificationsPage;
