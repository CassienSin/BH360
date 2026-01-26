import { Stack, Typography, Card, CardContent, Grid, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Analytics = () => {
  const theme = useTheme();

  const incidentData = [
    { name: 'Crime', value: 45, color: theme.palette.error.main },
    { name: 'Noise', value: 32, color: theme.palette.warning.main },
    { name: 'Disputes', value: 28, color: theme.palette.info.main },
    { name: 'Hazards', value: 18, color: theme.palette.success.main },
  ];

  const monthlyData = [
    { month: 'Jan', total: 42 },
    { month: 'Feb', total: 38 },
    { month: 'Mar', total: 45 },
    { month: 'Apr', total: 52 },
    { month: 'May', total: 48 },
    { month: 'Jun', total: 55 },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          Analytics & Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive insights and statistics
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Incidents by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {incidentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Monthly Incident Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip />
                  <Bar dataKey="total" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Analytics;

