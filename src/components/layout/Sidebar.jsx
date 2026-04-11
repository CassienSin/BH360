import { memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Divider,
  Avatar,
  alpha,
  Tooltip,
  IconButton,
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
  Calendar,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import Logo from '../common/Logo';
import { useT } from '../../context/LanguageContext';
import {
  ROLE_CAPTAIN, ROLE_KAGAWAD, ROLE_SECRETARY, ROLE_TANOD, ROLE_RESIDENT,
  ALL_ROLES, ADMIN_STAFF_ROLES, ROLE_LABEL_MAP,
} from '../../config/roles';

// ─── Nav item definitions ─────────────────────────────────────────────────────

const MENU_SECTIONS = [
  {
    labelKey: 'nav_section_main',
    items: [
      { icon: LayoutDashboard, labelKey: 'nav_dashboard',     path: '/dashboard', roles: [ROLE_CAPTAIN, ROLE_KAGAWAD, ROLE_SECRETARY, ROLE_TANOD] },
      { icon: AlertCircle,     labelKey: 'nav_incidents',     path: '/incidents', roles: [...ADMIN_STAFF_ROLES, ROLE_RESIDENT] },
      { icon: ClipboardCheck,  labelKey: 'nav_my_tasks',      path: '/tasks',     roles: [ROLE_TANOD] },
      { icon: Calendar,        labelKey: 'nav_my_schedule',   path: '/schedule',  roles: [ROLE_TANOD] },
      { icon: MessageCircle,   labelKey: 'nav_ai_helpdesk',   path: '/helpdesk',  roles: [ROLE_RESIDENT, ROLE_TANOD] },
      { icon: Bell,            labelKey: 'nav_announcements', path: '/announcements', roles: ALL_ROLES },
    ],
  },
  {
    labelKey: 'nav_section_administration',
    items: [
      { icon: Shield,   labelKey: 'nav_tanod_management',  path: '/tanod',     roles: ADMIN_STAFF_ROLES },
      { icon: Users,    labelKey: 'nav_user_management',   path: '/users',     roles: [ROLE_CAPTAIN] },
      { icon: Ticket,   labelKey: 'nav_ticket_management', path: '/tickets',   roles: ADMIN_STAFF_ROLES },
      { icon: BarChart3,labelKey: 'nav_analytics',         path: '/analytics', roles: ADMIN_STAFF_ROLES },
    ],
  },
  {
    labelKey: 'nav_section_account',
    items: [
      { icon: User,     labelKey: 'nav_profile',  path: '/profile',  roles: ALL_ROLES },
      { icon: Settings, labelKey: 'nav_settings', path: '/settings', roles: ALL_ROLES },
    ],
  },
];

// ─── Single nav item — memoized to avoid re-renders on unrelated state changes ─

const NavItem = memo(({ item, isActive, collapsed, onClick, t }) => {
  const { icon: Icon, labelKey } = item;
  const label = t(labelKey);

  const button = (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        sx={{
          borderRadius: 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 42,
          px: collapsed ? 1 : 1.5,
          backgroundColor: isActive ? alpha('#6366F1', 0.08) : 'transparent',
          '&:hover': {
            backgroundColor: isActive ? alpha('#6366F1', 0.12) : alpha('#6366F1', 0.04),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 40,
            justifyContent: 'center',
            mr: collapsed ? 0 : 0,
          }}
        >
          <Icon size={20} color={isActive ? '#6366F1' : '#64748B'} />
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'primary.main' : 'text.secondary',
              noWrap: true,
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );

  if (collapsed) {
    return (
      <Tooltip title={label} placement="right" arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
});
NavItem.displayName = 'NavItem';

// ─── Main Sidebar — memoized so it only re-renders when its own props change ──

/**
 * Sidebar
 *
 * Props:
 *   onClose          () => void   — closes mobile drawer
 *   collapsed        boolean      — rail mode (desktop only)
 *   onToggleCollapse () => void   — toggle collapse (desktop only)
 */
const Sidebar = memo(({ onClose, collapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useT();

  const handleNavigate = useCallback((path) => {
    navigate(path);
    onClose?.();
  }, [navigate, onClose]);

  const isActive = useCallback((path) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path)),
  [location.pathname]);

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      className="glass"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
        overflowX: 'hidden',
      }}
    >
      {/* ── Logo + collapse toggle ── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? 'center' : 'space-between'}
        sx={{ px: collapsed ? 1 : 2, mb: 1.5 }}
      >
        {!collapsed && <Logo size="medium" showText={true} variant="light" />}
        {collapsed && <Logo size="small" showText={false} variant="light" />}

        {onToggleCollapse && (
          <Tooltip
            title={collapsed ? t('sidebar_expand') : t('sidebar_collapse')}
            placement="right"
            arrow
          >
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              aria-label={collapsed ? t('sidebar_expand') : t('sidebar_collapse')}
              sx={{
                ml: collapsed ? 0 : 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '50%',
                width: 26,
                height: 26,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: alpha('#6366F1', 0.08),
                  borderColor: 'primary.main',
                },
                flexShrink: 0,
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {/* ── Nav sections ── */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', px: 1 }}>
        {MENU_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || (user && item.roles.includes(user.role))
          );
          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.labelKey} sx={{ mb: 1 }}>
              {!collapsed && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    display: 'block',
                    color: 'text.disabled',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  {t(section.labelKey)}
                </Typography>
              )}

              <List disablePadding>
                {visibleItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={isActive(item.path)}
                    collapsed={collapsed}
                    onClick={() => handleNavigate(item.path)}
                    t={t}
                  />
                ))}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* ── User card ── */}
      {user && (
        <Box sx={{ px: 1 }}>
          {collapsed ? (
            <Tooltip title={`${user.firstName} ${user.lastName} (${user.role})`} placement="right" arrow>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/profile')}
                  aria-label="Go to your profile"
                  sx={{
                    borderRadius: 2,
                    justifyContent: 'center',
                    py: 1,
                    '&:hover': { backgroundColor: alpha('#E2E8F0', 0.8) },
                  }}
                >
                  <Avatar
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    sx={{ width: 36, height: 36 }}
                  >
                    <User size={18} />
                  </Avatar>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ) : (
            <Tooltip title={t('sidebar_go_to_profile')} placement="top">
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/profile')}
                  aria-label="Go to your profile"
                  sx={{
                    borderRadius: 2,
                    p: 1.5,
                    backgroundColor: alpha('#F1F5F9', 0.5),
                    '&:hover': { backgroundColor: alpha('#E2E8F0', 0.8) },
                  }}
                >
                  <Avatar
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    sx={{ width: 36, height: 36, mr: 1.5 }}
                  >
                    <User size={18} />
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
                      sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
                    >
                      {ROLE_LABEL_MAP[user.role] || user.role}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
});
Sidebar.displayName = 'Sidebar';

export default Sidebar;
