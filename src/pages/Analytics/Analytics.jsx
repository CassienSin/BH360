import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Stack, Typography, Card, CardContent, Grid, Box, useTheme, Chip, alpha } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Brain, Sparkles } from 'lucide-react';
import { analyzeTrends } from '../../services/aiService';
import AIInsightsPanel from '../../components/ai/AIInsightsPanel';
import TrendAnalysisCharts from '../../components/ai/TrendAnalysisCharts';

// Mock incidents data for trend analysis
const mockIncidentsForAnalysis = [
  {
    id: '1',
    title: 'Loud music disturbance',
    description: 'Neighbors playing loud music late at night',
    category: 'noise',
    priority: 'minor',
    location: 'Purok 3, Barangay Hall Area',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    title: 'Broken streetlight',
    description: 'Streetlight not working for 3 days',
    category: 'hazard',
    priority: 'medium',
    location: 'Main Road, Block 5',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Suspicious person',
    description: 'Unknown person lurking around',
    category: 'crime',
    priority: 'high',
    location: 'Purok 3, Barangay Hall Area',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    title: 'Property dispute',
    description: 'Neighbors arguing over fence',
    category: 'dispute',
    priority: 'minor',
    location: 'Residential Area, Block 2',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    title: 'Street fight',
    description: 'Physical altercation between residents',
    category: 'crime',
    priority: 'emergency',
    location: 'Purok 3, Barangay Hall Area',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: '6',
    title: 'Fallen tree blocking road',
    description: 'Large tree fell during storm',
    category: 'hazard',
    priority: 'urgent',
    location: 'Main Road, Block 5',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: '7',
    title: 'Noise complaint',
    description: 'Construction noise early morning',
    category: 'noise',
    priority: 'minor',
    location: 'Residential Area, Block 2',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: '8',
    title: 'Theft reported',
    description: 'Motorcycle stolen from parking',
    category: 'crime',
    priority: 'urgent',
    location: 'Purok 3, Barangay Hall Area',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

const Analytics = () => {
  const theme = useTheme();
  const { incidents } = useSelector((state) => state.incident);
  const [trendData, setTrendData] = useState(null);

  // Use actual incidents if available, otherwise use mock data
  const incidentsData = incidents.length > 0 ? incidents : mockIncidentsForAnalysis;

  useEffect(() => {
    // Analyze trends using AI
    const analysis = analyzeTrends(incidentsData);
    setTrendData(analysis);
  }, [incidentsData]);

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
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="h4" fontWeight={700}>
            Analytics & Reports
          </Typography>
          <Chip
            icon={<Brain size={16} />}
            label="AI-Powered"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Comprehensive insights and statistics with AI-powered trend analysis
        </Typography>
      </Stack>

      {/* AI Insights Panel */}
      {trendData && trendData.insights && trendData.insights.length > 0 && (
        <AIInsightsPanel insights={trendData.insights} />
      )}

      {/* Summary Stats */}
      {trendData && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Total Incidents
                </Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {trendData.totalIncidents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {trendData.categoryTrends && trendData.categoryTrends.length > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                }}
              >
                <CardContent>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Top Category
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="error.main" textTransform="capitalize">
                    {trendData.categoryTrends[0].category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trendData.categoryTrends[0].percentage}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {trendData.frequentAreas && trendData.frequentAreas.length > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                }}
              >
                <CardContent>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Hotspot Area
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="warning.main" noWrap>
                    {trendData.frequentAreas[0].area}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trendData.frequentAreas[0].count} incidents
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {trendData.timePatterns && trendData.timePatterns.length > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                }}
              >
                <CardContent>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Peak Hour
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="info.main">
                    {trendData.timePatterns[0].hour}:00
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trendData.timePatterns[0].count} incidents
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* AI Trend Analysis Charts */}
      {trendData && <TrendAnalysisCharts trendData={trendData} />}

      {/* Original Charts */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Sparkles size={20} color={theme.palette.primary.main} />
          <Typography variant="h5" fontWeight={600}>
            Historical Data
          </Typography>
        </Stack>
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

