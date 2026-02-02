import { useState, useEffect } from 'react';
import { Stack, Typography, Card, CardContent, Grid, Box, useTheme, Chip, alpha, CircularProgress, Alert, Tab, Tabs } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Brain, Sparkles, TrendingUp, MapPin, LineChart as LineChartIcon } from 'lucide-react';
import { analyzeTrends } from '../../services/aiService';
import AIInsightsPanel from '../../components/ai/AIInsightsPanel';
import TrendAnalysisCharts from '../../components/ai/TrendAnalysisCharts';
import PredictiveAnalytics from '../../components/ai/PredictiveAnalytics';
import HotspotAnalysis from '../../components/ai/HotspotAnalysis';
import { useAllIncidents } from '../../hooks/useIncidents';

const Analytics = () => {
  const theme = useTheme();
  const { data: incidents = [], isLoading, error } = useAllIncidents();
  const [trendData, setTrendData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (incidents.length > 0) {
      // Analyze trends using enhanced AI
      const analysis = analyzeTrends(incidents);
      setTrendData(analysis);
    }
  }, [incidents]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Process incident data for visualization
  const processIncidentData = () => {
    if (incidents.length === 0) return [];

    const categoryCounts = {};
    incidents.forEach(incident => {
      const category = incident.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  const incidentData = processIncidentData();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Priority distribution
  const priorityData = [
    { name: 'Minor', value: incidents.filter(i => i.priority === 'minor').length },
    { name: 'Urgent', value: incidents.filter(i => i.priority === 'urgent').length },
    { name: 'Emergency', value: incidents.filter(i => i.priority === 'emergency').length },
  ];

  // Location hotspots (top 5)
  const locationCounts = {};
  incidents.forEach(incident => {
    const location = incident.location || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  const locationData = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Error state
  if (error) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Alert severity="error">
          Failed to load analytics data. Please check your Firebase connection.
        </Alert>
      </Stack>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Analytics & Insights
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  // No data state
  if (incidents.length === 0) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Analytics & Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered analysis of incident patterns and trends
          </Typography>
        </Stack>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            p: 6,
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Brain size={64} color={theme.palette.text.secondary} />
          </Box>
          <Typography variant="h6" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics will appear once incidents are reported in the system
          </Typography>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Analytics & Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AI-powered analysis of incident patterns and trends
        </Typography>
      </Stack>

      {/* Enhanced AI Insights Panel */}
      {trendData && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
              theme.palette.secondary.main,
              0.05
            )} 100%)`,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'inline-flex',
                }}
              >
                <Brain size={24} color={theme.palette.primary.main} />
              </Box>
              <Stack flexGrow={1}>
                <Typography variant="h6" fontWeight={700}>
                  AI-Generated Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyzing {incidents.length} incidents • {trendData.resolutionRate}% resolution rate
                </Typography>
              </Stack>
              <Chip
                label="ENHANCED AI v2.0"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <AIInsightsPanel insights={trendData.insights} />
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Incident by Category */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incidentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Stack direction="row" flexWrap="wrap" gap={1} mt={2} justifyContent="center">
                  {incidentData.map((entry, index) => (
                    <Chip
                      key={entry.name}
                      label={`${entry.name}: ${entry.value}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(COLORS[index % COLORS.length], 0.1),
                        color: COLORS[index % COLORS.length],
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Priority Distribution */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Priority Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Stack>

        {/* Location Hotspots */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Top 5 Location Hotspots
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis type="number" stroke={theme.palette.text.secondary} />
                <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} width={150} />
                <Tooltip />
                <Bar dataKey="value" fill={theme.palette.secondary.main} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Stack>

      {/* Advanced Analytics Tabs */}
      {trendData && (
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3
              }}
            >
              <Tab 
                icon={<Sparkles size={18} />} 
                iconPosition="start"
                label="Trend Analysis" 
                sx={{ fontWeight: 600 }}
              />
              <Tab 
                icon={<LineChartIcon size={18} />} 
                iconPosition="start"
                label="Predictive Analytics" 
                sx={{ fontWeight: 600 }}
              />
              <Tab 
                icon={<MapPin size={18} />} 
                iconPosition="start"
                label="Hotspot Analysis" 
                sx={{ fontWeight: 600 }}
              />
            </Tabs>

            {activeTab === 0 && <TrendAnalysisCharts trendData={trendData} incidents={incidents} />}
            {activeTab === 1 && <PredictiveAnalytics predictions={trendData.predictions} incidents={incidents} />}
            {activeTab === 2 && <HotspotAnalysis hotspotData={trendData.hotspots} />}
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 100%)`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Incidents
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {incidents.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(
                theme.palette.success.main,
                0.05
              )} 100%)`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {incidents.filter((i) => i.status === 'resolved').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(
                theme.palette.warning.main,
                0.05
              )} 100%)`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {incidents.filter((i) => i.status === 'in-progress').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(
                theme.palette.info.main,
                0.05
              )} 100%)`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h3" fontWeight={700} color="info.main">
                {incidents.filter((i) => i.status === 'submitted').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Analytics;
