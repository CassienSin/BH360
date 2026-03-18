import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  alpha,
  useTheme,
  Skeleton,
  Link,
  Chip,
} from '@mui/material';
import {
  Ticket,
  CircleDot,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutList,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTicketStats } from '../../hooks/useTickets';

// ─── Skeleton ────────────────────────────────────────────────────────────────

const RequestsOverviewSkeleton = () => (
  <Card className="glass">
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton width={80} height={20} />
      </Stack>
      {/* Stat chips */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1.5,
          mb: 3,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </Box>
      {/* Bar chart */}
      <Skeleton variant="rounded" height={200} />
    </CardContent>
  </Card>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '10px',
        px: 1.5,
        py: 1,
        boxShadow: '0 4px 16px rgba(15,23,42,0.12)',
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.primary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="primary.main">
        {payload[0].value} ticket{payload[0].value !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};

// ─── Stat Mini-Card ──────────────────────────────────────────────────────────

const StatMiniCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.75,
      p: { xs: 1.5, sm: 2 },
      borderRadius: '12px',
      backgroundColor: bgColor,
      border: `1px solid ${alpha(color, 0.2)}`,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        p: 0.75,
        borderRadius: '8px',
        backgroundColor: alpha(color, 0.15),
        display: 'inline-flex',
      }}
    >
      <Icon size={18} color={color} />
    </Box>
    <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1 }}>
      {value ?? 0}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={500}
      sx={{ lineHeight: 1.2, fontSize: '0.7rem' }}
    >
      {label}
    </Typography>
  </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const RequestsOverviewPanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: ticketStats, isLoading } = useTicketStats();

  if (isLoading) return <RequestsOverviewSkeleton />;

  const statCards = [
    {
      icon: LayoutList,
      label: 'Total Requests',
      value: ticketStats?.total,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.06),
    },
    {
      icon: CircleDot,
      label: 'Open',
      value: ticketStats?.open,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.06),
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: ticketStats?.inProgress,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.06),
    },
    {
      icon: CheckCircle2,
      label: 'Resolved',
      value: ticketStats?.resolved,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.06),
    },
    {
      icon: XCircle,
      label: 'Closed',
      value: ticketStats?.closed,
      color: theme.palette.grey[500],
      bgColor: alpha(theme.palette.grey[500], 0.06),
    },
  ];

  const chartData = [
    { status: 'Open', count: ticketStats?.open ?? 0, color: theme.palette.info.main },
    { status: 'In Progress', count: ticketStats?.inProgress ?? 0, color: theme.palette.warning.main },
    { status: 'Resolved', count: ticketStats?.resolved ?? 0, color: theme.palette.success.main },
    { status: 'Closed', count: ticketStats?.closed ?? 0, color: theme.palette.grey[500] },
  ];

  const total = ticketStats?.total ?? 0;
  const openRate = total > 0 ? Math.round(((ticketStats?.open ?? 0) / total) * 100) : 0;
  const resolvedRate = total > 0 ? Math.round(((ticketStats?.resolved ?? 0) / total) * 100) : 0;

  return (
    <Card className="glass" sx={{ animation: 'fadeIn 0.7s ease-out' }}>
      <CardContent>
        {/* ── Header ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'inline-flex',
              }}
            >
              <Ticket size={20} color={theme.palette.primary.main} />
            </Box>
            <Stack spacing={0}>
              <Typography variant="h5" fontWeight={600}>
                Requests Overview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tickets &amp; service requests summary
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            {resolvedRate > 0 && (
              <Chip
                label={`${resolvedRate}% resolved`}
                size="small"
                color="success"
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            )}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/tickets')}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View All →
            </Link>
          </Stack>
        </Stack>

        {/* ── Stat Mini-Cards ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, 1fr)',
              sm: 'repeat(5, 1fr)',
            },
            gap: 1.5,
            mb: 3,
          }}
        >
          {statCards.map((stat) => (
            <StatMiniCard key={stat.label} {...stat} />
          ))}
        </Box>

        {/* ── Bar Chart ── */}
        {total > 0 ? (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1.5}>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={36} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.grey[100], 0.8),
            }}
          >
            <Ticket size={32} color={theme.palette.grey[400]} style={{ marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">
              No ticket requests yet
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsOverviewPanel;
