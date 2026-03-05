import { useMemo, useEffect } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  alpha,
  useTheme,
  Alert,
  Skeleton,
} from '@mui/material';
import { AlertCircle, Shield, Users, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useIncidentStats, useRecentIncidents, useAllIncidents } from '../../hooks/useIncidents';
import { useActiveTanods } from '../../hooks/useTanod';
import { useUserStats } from '../../hooks/useUsers';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel';
import RecentIncidentsTable from '../../components/dashboard/RecentIncidentsTable';

// ─── Skeleton placeholders for CLS reduction (Issue #1) ──────────────────────

const StatCardSkeleton = () => (
  <Card className="glass">
    <CardContent>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Skeleton variant="rounded" width={56} height={56} />
          <Skeleton width={60} height={20} />
        </Stack>
        <Stack spacing={0.5}>
          <Skeleton variant="text" width={80} height={44} />
          <Skeleton variant="text" width={130} height={20} />
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

const ChartCardSkeleton = ({ height = 300, rows }) => (
  <Card className="glass">
    <CardContent>
      <Skeleton variant="text" width={220} height={32} sx={{ mb: 2 }} />
      {rows ? (
        <Stack spacing={2}>
          {Array.from({ length: rows }).map((_, i) => (
            <Stack key={i} spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Skeleton width={80} height={20} />
                <Skeleton width={30} height={20} />
              </Stack>
              <Skeleton variant="rounded" height={8} />
            </Stack>
          ))}
        </Stack>
      ) : (
        <Skeleton variant="rounded" height={height} />
      )}
    </CardContent>
  </Card>
);

const RecentTableSkeleton = () => (
  <Card className="glass">
    <CardContent>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Skeleton variant="text" width={160} height={32} />
        <Skeleton width={70} height={20} />
      </Stack>
      <Stack spacing={1}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={44} />
        ))}
      </Stack>
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const theme = useTheme();

  // Issue #23: Update document title on mount
  useEffect(() => {
    document.title = 'Dashboard – BH360';
  }, []);

  const { data: incidentStats, isLoading: loadingIncidents, error: incidentsError } = useIncidentStats();
  const { data: recentIncidents, isLoading: loadingRecent } = useRecentIncidents(5);
  const { data: activeTanods, isLoading: loadingTanods } = useActiveTanods();
  const { data: userStats, isLoading: loadingUsers } = useUserStats();
  const { data: allIncidents = [] } = useAllIncidents();

  const isLoading = loadingIncidents || loadingTanods || loadingUsers;

  const responseRate = incidentStats
    ? Math.round((incidentStats.resolved / incidentStats.total) * 100) || 0
    : 0;

  const stats = [
    {
      icon: AlertCircle,
      label: 'Total Incidents',
      value: incidentStats?.total?.toString() ?? '0',
      change: `+${incidentStats?.submitted ?? 0}`,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      icon: Shield,
      label: 'Active Tanods',
      value: activeTanods?.length?.toString() ?? '0',
      change: 'On duty',
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      icon: Users,
      label: 'Registered Users',
      value: userStats?.total?.toString() ?? '0',
      change: `${userStats?.residents ?? 0} residents`,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
    {
      icon: TrendingUp,
      label: 'Response Rate',
      value: `${responseRate}%`,
      change: `${incidentStats?.resolved ?? 0} resolved`,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
  ];

  const trendData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const count = allIncidents.filter((incident) => {
        const created = incident.createdAt?.toDate
          ? incident.createdAt.toDate()
          : new Date(incident.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;
      return { month: format(monthDate, 'MMM'), incidents: count };
    });
  }, [allIncidents]);

  const categoryData = [
    { label: 'Submitted', count: incidentStats?.submitted ?? 0, color: theme.palette.info.main },
    { label: 'In Progress', count: incidentStats?.inProgress ?? 0, color: theme.palette.warning.main },
    { label: 'Resolved', count: incidentStats?.resolved ?? 0, color: theme.palette.success.main },
    { label: 'Rejected', count: incidentStats?.rejected ?? 0, color: theme.palette.error.main },
  ];

  const maxCount = Math.max(...categoryData.map((c) => c.count), 1);

  if (incidentsError) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Alert severity="error">
          Failed to load dashboard data. Please check your Firebase connection.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* ── Page heading — Issue #6: component="h1" ── */}
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of barangay operations and incidents
        </Typography>
      </Stack>

      {/* ── Quick Actions (role-gated shortcuts) ── */}
      <QuickActionsPanel />

      {/* ── Issue #1: Skeleton instead of full-page spinner ── */}
      {isLoading ? (
        <>
          {/* Stat card skeletons — 2-col on mobile, 4-col on desktop */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </Box>

          {/* Chart skeletons */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              <ChartCardSkeleton height={300} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ChartCardSkeleton rows={4} />
            </Box>
          </Stack>

          {/* Recent incidents table skeleton */}
          <RecentTableSkeleton />
        </>
      ) : (
        <>
          {/* ── Stat Cards — 2-col on mobile, 4-col on desktop ── */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                // Stat cards are not clickable — no hover-lift (Issue #17)
                <Card
                  key={stat.label}
                  className="glass"
                  sx={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: stat.bgColor,
                            display: 'inline-flex',
                          }}
                        >
                          <Icon size={24} color={stat.color} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {stat.change}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="h4" fontWeight={700}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* ── Charts — Issue #7: h5 headings to avoid heading level skip ── */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* Line Chart */}
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              <Card className="glass" sx={{ animation: 'fadeIn 0.6s ease-out' }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} mb={2}>
                    Incident Trends (Last 6 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="incidents"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ fill: theme.palette.primary.main, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Status breakdown */}
            <Box sx={{ flex: 1 }}>
              <Card className="glass" sx={{ height: '100%', animation: 'fadeIn 0.7s ease-out' }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} mb={2}>
                    Incident Status
                  </Typography>
                  <Stack spacing={2}>
                    {categoryData.map((item) => (
                      <Stack key={item.label} spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={500}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {item.count}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            backgroundColor: alpha(item.color, 0.1),
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              width: `${(item.count / maxCount) * 100}%`,
                              backgroundColor: item.color,
                              borderRadius: 1,
                              transition: 'width 0.6s ease-out',
                            }}
                          />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>

          {/* ── Recent Incidents Table — replaces stack-based layout ── */}
          <RecentIncidentsTable
            incidents={recentIncidents ?? []}
            isLoading={loadingRecent}
            limit={5}
          />
        </>
      )}
    </Stack>
  );
};

export default Dashboard;
