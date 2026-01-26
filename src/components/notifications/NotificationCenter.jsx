import { useState } from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Stack,
  Divider,
  IconButton,
  Box,
  alpha,
  useTheme,
  Chip,
  Badge,
  Button,
} from '@mui/material';
import { Bell, Check, CheckCheck, Ticket, Bell as BellIcon, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { markAsRead, markAllAsRead, clearNotifications } from '../../store/slices/notificationSlice';
import { format } from 'date-fns';

const NotificationCenter = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);
  const { user } = useAppSelector((state) => state.auth);

  // Filter notifications for current user
  const userNotifications = notifications.filter((n) => n.userId === user?.id);

  const getIcon = (category) => {
    switch (category) {
      case 'ticket':
        return <Ticket size={18} />;
      case 'announcement':
        return <BellIcon size={18} />;
      case 'incident':
        return <AlertCircle size={18} />;
      default:
        return <Bell size={18} />;
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

  const handleNotificationClick = (notification) => {
    dispatch(markAsRead(notification.id));
    if (notification.link) {
      navigate(notification.link);
    }
    onClose();
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      dispatch(clearNotifications());
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 380,
          maxWidth: 420,
          maxHeight: 600,
          borderRadius: 2,
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              color="error"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={handleMarkAllAsRead} title="Mark all as read">
              <CheckCheck size={18} />
            </IconButton>
          )}
          {userNotifications.length > 0 && (
            <IconButton size="small" onClick={handleClearAll} title="Clear all">
              <Trash2 size={18} />
            </IconButton>
          )}
        </Stack>
      </Stack>
      <Divider />

      {/* Notifications List */}
      {userNotifications.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              mb: 2,
            }}
          >
            <Bell size={32} color={theme.palette.text.secondary} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            No notifications yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You'll be notified when there are updates
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {userNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: notification.read
                  ? 'transparent'
                  : alpha(theme.palette.primary.main, 0.05),
                borderLeft: notification.read
                  ? 'none'
                  : `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Stack direction="row" spacing={1.5} width="100%">
                {/* Icon */}
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: alpha(getTypeColor(notification.type), 0.1),
                    color: getTypeColor(notification.type),
                    height: 'fit-content',
                  }}
                >
                  {getIcon(notification.category)}
                </Box>

                {/* Content */}
                <Stack spacing={0.5} flex={1} minWidth={0}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={notification.read ? 500 : 700}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {notification.title}
                  </Typography>
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
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Stack>

                {/* Read indicator */}
                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      mt: 1,
                    }}
                  />
                )}
              </Stack>
            </MenuItem>
          ))}
        </Box>
      )}

      {userNotifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
            >
              View All Notifications
            </Button>
          </Box>
        </>
      )}
    </Menu>
  );
};

export default NotificationCenter;
