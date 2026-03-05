import { memo, useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Stack,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { logout as firebaseLogout } from '../../services/firebaseAuthService';
import { useT } from '../../context/LanguageContext';
import NotificationCenter from '../notifications/NotificationCenter';
import AppBreadcrumb from './AppBreadcrumb';

// Issue #21: Map routes to translation keys for the header
const ROUTE_TITLE_KEYS = {
  '/dashboard':          'page_dashboard',
  '/incidents':          'page_incidents',
  '/incidents/create':   'page_report_incident',
  '/tasks':              'page_my_tasks',
  '/tanod':              'page_tanod_management',
  '/tanod/performance':  'page_performance_insights',
  '/users':              'page_user_management',
  '/helpdesk':           'page_ai_helpdesk',
  '/tickets':            'page_ticket_management',
  '/announcements':      'page_announcements',
  '/analytics':          'page_analytics',
  '/profile':            'page_profile',
  '/settings':           'page_settings',
};

const getPageTitleKey = (pathname) => {
  if (pathname.startsWith('/incidents/create')) return 'page_report_incident';
  if (pathname.startsWith('/incidents/'))       return 'page_incident_details';
  if (pathname.startsWith('/tanod/performance')) return 'page_performance_insights';
  return ROUTE_TITLE_KEYS[pathname] || null;
};

const Header = memo(({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);

  const { t } = useT();
  const pageTitleKey = getPageTitleKey(location.pathname);
  const pageTitle = pageTitleKey ? t(pageTitleKey) : 'BH360';

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleOpenUserMenu = useCallback((event) => {
    setAnchorElUser(event.currentTarget);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, []);

  const handleOpenNotifications = useCallback((event) => {
    setAnchorElNotifications(event.currentTarget);
  }, []);

  const handleCloseNotifications = useCallback(() => {
    setAnchorElNotifications(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await firebaseLogout();
      dispatch(logoutAction());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  }, [dispatch, navigate]);

  const handleGoToProfile = useCallback(() => {
    handleCloseUserMenu();
    navigate('/profile');
  }, [handleCloseUserMenu, navigate]);

  const handleGoToSettings = useCallback(() => {
    handleCloseUserMenu();
    navigate('/settings');
  }, [handleCloseUserMenu, navigate]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      <Toolbar>
        {/* Menu Icon for Mobile */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          sx={{
            mr: 2,
            display: { md: 'none' },
            color: 'text.primary',
          }}
        >
          <MenuIcon size={24} />
        </IconButton>

        {/* Issue #21: Breadcrumb on nested routes, page title on top-level */}
        <Stack sx={{ flexGrow: 1 }}>
          {/* Desktop: breadcrumb or page title */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <AppBreadcrumb pageTitle={pageTitle} />
          </Box>
          {/* Mobile: always show page title */}
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.primary"
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            {pageTitle}
          </Typography>
          {/* Greeting — only on top-level pages and only desktop */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            {t('header_welcome_back')}, {user?.firstName}!
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Issue #3: aria-label added to notification bell */}
          <IconButton
            onClick={handleOpenNotifications}
            aria-label={`Notifications${unreadCount ? ` — ${unreadCount} unread` : ''}`}
            sx={{ color: 'text.primary' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* Issue #3: aria-label added to user menu */}
          <IconButton
            onClick={handleOpenUserMenu}
            aria-label="Open user menu"
            aria-haspopup="true"
            aria-expanded={Boolean(anchorElUser)}
            sx={{ p: 0.5, ml: 1 }}
          >
            <Avatar
              src={user?.profileImage}
              alt={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User avatar'}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <User size={20} />
            </Avatar>
          </IconButton>
        </Stack>

        {/* Notification Menu */}
        <NotificationCenter
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
        />

        {/* User Menu */}
        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { mt: 1.5, minWidth: 200 },
          }}
        >
          <Stack sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Stack>
          <Divider />
          <MenuItem onClick={handleGoToProfile}>
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            {t('header_profile')}
          </MenuItem>
          <MenuItem onClick={handleGoToSettings}>
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            {t('header_settings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogOut size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            {t('header_logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
});
Header.displayName = 'Header';

export default Header;
