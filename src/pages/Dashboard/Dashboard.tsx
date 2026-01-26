import { Stack, Typography, Grid, Card, CardContent, Box, alpha, useTheme } from '@mui/material';
import { AlertCircle, Shield, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockIncidentData = [
  { month: 'Jan', incidents: 12 },
  { month: 'Feb', incidents: 19 },
  { month: 'Mar', incidents: 15 },
  { month: 'Apr', incidents: 25 },
  { month: 'May', incidents: 22 },
  { month: 'Jun', incidents: 30 },
];

const Dashboard = () => {
  const theme = useTheme();

  const stats = [
    {
      icon: AlertCircle,
      label: 'Total Incidents',
      value: '123',
      change: '+12%',
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      icon: Shield,
      label: 'Active Tanods',
      value: '24',
      change: '+2',
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      icon: Users,
      label: 'Registered Users',
      value: '1,284',
      change: '+48',
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
    {
      icon: TrendingUp,
      label: 'Response Rate',
      value: '94%',
      change: '+5%',
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
  ];

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
                          color: stat.change.startsWith('+') ? 'success.main' : 'error.main',
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
                Incident Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockIncidentData}>
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
                Incident Categories
              </Typography>
              <Stack spacing={2}>
                {[
                  { label: 'Crime', count: 45, color: theme.palette.error.main },
                  { label: 'Noise', count: 32, color: theme.palette.warning.main },
                  { label: 'Disputes', count: 28, color: theme.palette.info.main },
                  { label: 'Hazards', count: 18, color: theme.palette.success.main },
                ].map((item) => (
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
                          width: `${(item.count / 45) * 100}%`,
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
          <Stack spacing={2}>
            {[
              { id: 1, title: 'Noise complaint', status: 'in-progress', time: '2 hours ago' },
              { id: 2, title: 'Street hazard reported', status: 'resolved', time: '4 hours ago' },
              { id: 3, title: 'Suspicious activity', status: 'submitted', time: '6 hours ago' },
            ].map((incident) => (
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
                    {incident.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {incident.time}
                  </Typography>
                </Stack>
                <Box
                  className={`status-badge ${incident.status}`}
                >
                  {incident.status.replace('-', ' ')}
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Dashboard;
