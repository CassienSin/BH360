import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Stack,
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
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import RoleSwitcher from './RoleSwitcher';
import NotificationCenter from '../notifications/NotificationCenter';

const Header = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
          sx={{
            mr: 2,
            display: { md: 'none' },
            color: 'text.primary',
          }}
        >
          <MenuIcon size={24} />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: 'text.primary',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Welcome back, {user?.firstName}!
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Notifications */}
          <IconButton
            onClick={handleOpenNotifications}
            sx={{
              color: 'text.primary',
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={handleOpenUserMenu}
            sx={{
              p: 0.5,
              ml: 1,
            }}
          >
            <Avatar
              src={user?.profileImage}
              alt={user?.firstName}
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
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
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
          <MenuItem
            onClick={() => {
              handleCloseUserMenu();
              navigate('/profile');
            }}
          >
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseUserMenu();
              navigate('/profile#settings');
            }}
          >
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogOut size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
