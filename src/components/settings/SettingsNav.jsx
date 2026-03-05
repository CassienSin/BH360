import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
  Divider,
  alpha,
} from '@mui/material';
import {
  Settings,
  Bell,
  Lock,
  Clock,
  Palette,
  ClipboardList,
  Link2,
  Database,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

const NAV_ITEMS = [
  { value: 'general',       label: 'General',             desc: 'App info, localization',    icon: Settings, roles: ['admin', 'staff', 'resident'] },
  { value: 'notifications', label: 'Notifications',       desc: 'Email & push alerts',       icon: Bell,     roles: ['admin', 'staff'] },
  { value: 'roles',         label: 'Roles & Permissions', desc: 'Access control matrix',     icon: Lock,     roles: ['admin'] },
  { value: 'sla',           label: 'Incident SLA',        desc: 'Response thresholds',       icon: Clock,    roles: ['admin', 'staff'] },
  { divider: true, roles: ['admin', 'staff'] },
  { value: 'appearance',    label: 'Appearance',          desc: 'Theme & branding',          icon: Palette,  roles: ['admin', 'staff'] },
  { value: 'audit',         label: 'Audit Log',           desc: 'System activity trail',     icon: ClipboardList, roles: ['admin', 'staff'] },
  { divider: true, roles: ['admin', 'staff'] },
  { value: 'integrations',  label: 'Integrations',        desc: 'Firebase, SMS, email',      icon: Link2,    roles: ['admin'], disabled: true },
  { value: 'backup',        label: 'Data & Backup',       desc: 'Export, archive',           icon: Database, roles: ['admin'], disabled: true },
];

const SettingsNav = ({ activeTab, onTabChange }) => {
  const { user } = useAppSelector((s) => s.auth);
  const userRole = user?.role ?? 'resident';
  const visibleItems = NAV_ITEMS.filter((item) =>
    !item.roles || item.roles.includes(userRole),
  );

  return (
  <Box
    sx={{
      width: { xs: 0, sm: 200 },
      minWidth: { xs: 0, sm: 200 },
      flexShrink: 0,
      borderRight: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: { xs: 'none', sm: 'flex' },
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}
  >
    {/* ── Title ── */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: 'text.secondary',
          fontSize: '0.68rem',
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}
      >
        Configuration
      </Typography>
    </Box>

    {/* ── Nav items ── */}
    <List dense sx={{ px: 1, py: 0.75, flex: 1 }}>
      {visibleItems.map((item, idx) => {
        if (item.divider) return <Divider key={`div-${idx}`} sx={{ my: 0.75, mx: 1 }} />;

        const Icon = item.icon;
        const isActive = activeTab === item.value;

        return (
          <ListItemButton
            key={item.value}
            onClick={() => !item.disabled && onTabChange(item.value)}
            disabled={item.disabled}
            sx={{
              borderRadius: '8px',
              mb: 0.25,
              px: 1.25,
              py: 0.875,
              gap: 1.25,
              alignItems: 'flex-start',
              backgroundColor: isActive ? alpha('#6366F1', 0.08) : 'transparent',
              borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
              '&:hover': {
                backgroundColor: isActive
                  ? alpha('#6366F1', 0.12)
                  : alpha('#6366F1', 0.04),
              },
              '&.Mui-disabled': { opacity: 0.45 },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mt: 0.25 }}>
              <Icon size={15} color={isActive ? '#6366F1' : '#64748B'} />
            </ListItemIcon>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'primary.main' : 'text.primary',
                  fontSize: '0.8125rem',
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.69rem', display: 'block', lineHeight: 1.25, mt: 0.125 }}
              >
                {item.desc}
              </Typography>
            </Box>
          </ListItemButton>
        );
      })}
    </List>
  </Box>
  );
};

export default SettingsNav;
