import { Stack, Typography, Grid, Card, CardContent, Box, alpha, useTheme, CircularProgress, Alert } from '@mui/material';
import { AlertCircle, Shield, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useIncidentStats, useRecentIncidents } from '../../hooks/useIncidents';
import { useActiveTanods } from '../../hooks/useTanod';
import { useUserStats } from '../../hooks/useUsers';
import { format, subMonths, startOfMonth } from 'date-fns';

const Dashboard = () => {
  const theme = useTheme();

  // Fetch real-time data from Firebase
  const { data: incidentStats, isLoading: loadingIncidents, error: incidentsError } = useIncidentStats();
  const { data: recentIncidents, isLoading: loadingRecent } = useRecentIncidents(3);
  const { data: activeTanods, isLoading: loadingTanods } = useActiveTanods();
  const { data: userStats, isLoading: loadingUsers } = useUserStats();

  // Loading state
  const isLoading = loadingIncidents || loadingRecent || loadingTanods || loadingUsers;

  // Calculate response rate (example calculation)
  const responseRate = incidentStats 
    ? Math.round((incidentStats.resolved / incidentStats.total) * 100) || 0
    : 0;

  // Prepare stats cards data
  const stats = [
    {
      icon: AlertCircle,
      label: 'Total Incidents',
      value: incidentStats?.total?.toString() || '0',
      change: `+${incidentStats?.submitted || 0}`,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      icon: Shield,
      label: 'Active Tanods',
      value: activeTanods?.length?.toString() || '0',
      change: 'On duty',
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      icon: Users,
      label: 'Registered Users',
      value: userStats?.total?.toString() || '0',
      change: `${userStats?.residents || 0} residents`,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
    {
      icon: TrendingUp,
      label: 'Response Rate',
      value: `${responseRate}%`,
      change: `${incidentStats?.resolved || 0} resolved`,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
  ];

  // Generate mock trend data (you can replace this with actual historical data)
  const generateTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, 'MMM'),
        incidents: Math.floor(Math.random() * 20) + 10,
      });
    }
    return months;
  };

  const trendData = generateTrendData();

  // Prepare category data
  const categoryData = [
    { label: 'Submitted', count: incidentStats?.submitted || 0, color: theme.palette.info.main },
    { label: 'In Progress', count: incidentStats?.inProgress || 0, color: theme.palette.warning.main },
    { label: 'Resolved', count: incidentStats?.resolved || 0, color: theme.palette.success.main },
    { label: 'Rejected', count: incidentStats?.rejected || 0, color: theme.palette.error.main },
  ];

  const maxCount = Math.max(...categoryData.map(c => c.count), 1);

  // Format incident status for display
  const formatStatus = (status) => {
    return status?.replace('-', ' ') || 'unknown';
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  // Error state
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
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of barangay operations and incidents
        </Typography>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                  <Card
                    className="glass hover-lift"
                    sx={{
                      height: '100%',
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
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
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 600,
                            }}
                          >
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
                </Grid>
              );
            })}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                className="glass hover-lift"
                sx={{
                  animation: 'fadeIn 0.6s ease-out',
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
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
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="glass hover-lift"
                sx={{
                  height: '100%',
                  animation: 'fadeIn 0.7s ease-out',
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
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
                            }}
                          />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Incidents */}
          <Card
            className="glass hover-lift"
            sx={{
              animation: 'fadeIn 0.8s ease-out',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Incidents
              </Typography>
              {recentIncidents && recentIncidents.length > 0 ? (
                <Stack spacing={2}>
                  {recentIncidents.map((incident) => (
                    <Stack
                      key={incident.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.grey[100], 0.5),
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="body1" fontWeight={500}>
                          {incident.title || incident.description || 'Untitled Incident'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(incident.createdAt)}
                        </Typography>
                      </Stack>
                      <Box
                        className={`status-badge ${incident.status}`}
                      >
                        {formatStatus(incident.status)}
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent incidents
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
};

export default Dashboard;
