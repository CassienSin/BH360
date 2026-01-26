import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Divider,
  Avatar,
  alpha,
} from '@mui/material';
import {
  LayoutDashboard,
  AlertCircle,
  Shield,
  Users,
  MessageCircle,
  Bell,
  BarChart3,
  User,
  ClipboardCheck,
  Ticket,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import Logo from '../common/Logo';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'staff', 'tanod', 'resident'] },
  { icon: AlertCircle, label: 'Incidents', path: '/incidents', roles: ['admin', 'staff', 'resident'] },
  { icon: ClipboardCheck, label: 'My Tasks', path: '/tasks', roles: ['tanod'] },
  { icon: Shield, label: 'Tanod Management', path: '/tanod', roles: ['admin', 'staff'] },
  { icon: Users, label: 'User Management', path: '/users', roles: ['admin'] },
  { icon: Ticket, label: 'Ticket Management', path: '/tickets', roles: ['admin', 'staff'] },
  { icon: MessageCircle, label: 'AI Help Desk', path: '/helpdesk', roles: ['resident', 'tanod'] },
  { icon: Bell, label: 'Announcements', path: '/announcements', roles: ['admin', 'staff', 'tanod', 'resident'] },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['admin', 'staff'] },
];

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <Box
      className="glass"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
      }}
    >
      {/* Logo Section */}
      <Box sx={{ px: 3, mb: 3 }}>
        <Logo size="medium" showText={true} variant="green" />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive
                  ? alpha('#3457D5', 0.08)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha('#3457D5', 0.12)
                    : alpha('#3457D5', 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon
                  size={20}
                  color={isActive ? '#3457D5' : '#64748B'}
                />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'primary.main' : 'text.secondary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mb: 2 }} />

      {/* User Profile Section */}
      {user && (
        <ListItemButton
          onClick={() => handleNavigate('/profile')}
          sx={{
            mx: 2,
            borderRadius: 2,
            p: 1.5,
            backgroundColor: alpha('#F1F5F9', 0.5),
            '&:hover': {
              backgroundColor: alpha('#E2E8F0', 0.8),
            },
          }}
        >
          <Avatar
            src={user.profileImage}
            alt={`${user.firstName} ${user.lastName}`}
            sx={{ width: 40, height: 40, mr: 1.5 }}
          >
            <User size={20} />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'capitalize',
              }}
            >
              {user.role}
            </Typography>
          </Box>
        </ListItemButton>
      )}
    </Box>
  );
};

export default Sidebar;
