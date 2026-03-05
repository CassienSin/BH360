import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  AlertCircle,
  Shield,
  Bell,
  BarChart3,
  MessageCircle,
  User,
  ClipboardCheck,
  Ticket,
  CalendarDays,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

/**
 * Role-gated Quick Actions map.
 * Each action: { icon, label, path, paletteKey }
 */
const ACTION_MAP = {
  admin: [
    { icon: AlertCircle, label: 'Report Incident', path: '/incidents/create', paletteKey: 'primary' },
    { icon: Shield, label: 'Tanod Mgmt', path: '/tanod', paletteKey: 'info' },
    { icon: Bell, label: 'Announcements', path: '/announcements', paletteKey: 'warning' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', paletteKey: 'success' },
  ],
  staff: [
    { icon: AlertCircle, label: 'Report Incident', path: '/incidents/create', paletteKey: 'primary' },
    { icon: Shield, label: 'Tanod Mgmt', path: '/tanod', paletteKey: 'info' },
    { icon: Bell, label: 'Announcements', path: '/announcements', paletteKey: 'warning' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', paletteKey: 'success' },
  ],
  resident: [
    { icon: AlertCircle, label: 'Report Incident', path: '/incidents/create', paletteKey: 'primary' },
    { icon: MessageCircle, label: 'AI Help Desk', path: '/helpdesk', paletteKey: 'info' },
    { icon: Bell, label: 'Announcements', path: '/announcements', paletteKey: 'warning' },
    { icon: User, label: 'My Profile', path: '/profile', paletteKey: 'success' },
  ],
  tanod: [
    { icon: ClipboardCheck, label: 'My Tasks', path: '/tasks', paletteKey: 'primary' },
    { icon: CalendarDays, label: 'My Schedule', path: '/schedule', paletteKey: 'info' },
    { icon: Bell, label: 'Announcements', path: '/announcements', paletteKey: 'warning' },
    { icon: User, label: 'My Profile', path: '/profile', paletteKey: 'success' },
  ],
};

const QuickActionsPanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const actions = ACTION_MAP[user?.role] ?? ACTION_MAP.resident;

  return (
    <Card className="glass" sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          {actions.map(({ icon: Icon, label, path, paletteKey }) => {
            const color = theme.palette[paletteKey]?.main ?? theme.palette.primary.main;
            return (
              <Tooltip key={path} title={label} placement="top" arrow>
                <Box
                  component="button"
                  onClick={() => navigate(path)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    p: { xs: 1.5, sm: 2 },
                    border: `2px dashed ${alpha(color, 0.35)}`,
                    borderRadius: 2,
                    background: alpha(color, 0.05),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    width: '100%',
                    '&:hover': {
                      background: alpha(color, 0.12),
                      borderColor: color,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${color}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      backgroundColor: alpha(color, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} color={color} />
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.3 }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;
