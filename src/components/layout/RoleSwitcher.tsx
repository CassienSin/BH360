import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  alpha,
} from '@mui/material';
import { Shield, User, UserCheck, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser, type User as UserType } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const roles: Array<{ value: UserType['role']; label: string; icon: typeof Shield; color: string }> = [
  { value: 'admin', label: 'Admin', icon: Shield, color: '#6366F1' },
  { value: 'resident', label: 'Resident', icon: User, color: '#10B981' },
  { value: 'tanod', label: 'Tanod', icon: UserCheck, color: '#EC4899' },
];

const RoleSwitcher = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleChange = (role: UserType['role']) => {
    dispatch(updateUser({ role }));
    toast.success(`Switched to ${role} role`);
    handleClose();
  };

  const currentRole = roles.find((r) => r.value === user?.role);
  const CurrentIcon = currentRole?.icon || Shield;

  return (
    <Box>
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        endIcon={<ChevronDown size={16} />}
        sx={{
          borderRadius: 3,
          textTransform: 'capitalize',
          borderColor: alpha(currentRole?.color || '#6366F1', 0.3),
          color: currentRole?.color,
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(currentRole?.color || '#6366F1', 0.1),
          '&:hover': {
            borderColor: currentRole?.color,
            backgroundColor: alpha(currentRole?.color || '#6366F1', 0.15),
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CurrentIcon size={16} />
          <Typography variant="body2" fontWeight={600}>
            {currentRole?.label}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 180,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Switch Role
          </Typography>
        </Box>
        <Divider />
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = user?.role === role.value;

          return (
            <MenuItem
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
              disabled={isActive}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: isActive ? alpha(role.color, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(role.color, 0.15),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon size={18} color={role.color} />
              </ListItemIcon>
              <ListItemText
                primary={role.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? role.color : 'text.primary',
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default RoleSwitcher;
