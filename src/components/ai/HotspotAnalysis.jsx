import { Stack, Card, CardContent, Typography, Box, Chip, alpha, useTheme, Grid, Divider } from '@mui/material';
import { MapPin, AlertTriangle, TrendingUp, Shield, Eye } from 'lucide-react';

const HotspotAnalysis = ({ hotspotData }) => {
  const theme = useTheme();

  if (!hotspotData || !hotspotData.hotspots || hotspotData.hotspots.length === 0) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No hotspot data available yet. Data will appear as incidents are recorded.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      default:
        return theme.palette.success.main;
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'critical':
      case 'high':
        return <AlertTriangle size={20} />;
      case 'medium':
        return <Eye size={20} />;
      default:
        return <Shield size={20} />;
    }
  };

  const topHotspots = hotspotData.hotspots.slice(0, 5);

  return (
    <Stack spacing={3}>
      {/* Summary Stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(
                theme.palette.error.main,
                0.05
              )} 100%)`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Critical Risk
              </Typography>
              <Typography variant="h3" fontWeight={700} color="error.main">
                {hotspotData.criticalCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
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
              <Typography variant="caption" color="text.secondary">
                High Risk
              </Typography>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {hotspotData.highRiskCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
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
              <Typography variant="caption" color="text.secondary">
                Total Hotspots
              </Typography>
              <Typography variant="h3" fontWeight={700} color="info.main">
                {hotspotData.hotspots.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                identified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
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
              <Typography variant="caption" color="text.secondary">
                Trending Up
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {hotspotData.hotspots.filter(h => h.trendingUp).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Hotspots */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <MapPin size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={600}>
              Top Risk Locations
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {topHotspots.map((hotspot, index) => {
              const riskColor = getRiskColor(hotspot.riskLevel);
              
              return (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: `2px solid ${alpha(riskColor, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(riskColor, 0.08)} 0%, ${alpha(riskColor, 0.03)} 100%)`,
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Stack spacing={0.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="h6" fontWeight={700}>
                              #{index + 1} {hotspot.location}
                            </Typography>
                            {hotspot.trendingUp && (
                              <Chip
                                icon={<TrendingUp size={14} />}
                                label="TRENDING"
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.error.main, 0.15),
                                  color: theme.palette.error.main,
                                  fontWeight: 700,
                                  fontSize: '0.65rem',
                                  height: 20
                                }}
                              />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Peak incidents at {hotspot.peakHour}:00 • Most common: {hotspot.peakCategory}
                          </Typography>
                        </Stack>

                        <Stack spacing={0.5} alignItems="flex-end">
                          <Chip
                            icon={getRiskIcon(hotspot.riskLevel)}
                            label={hotspot.riskLevel.toUpperCase()}
                            sx={{
                              backgroundColor: alpha(riskColor, 0.2),
                              color: riskColor,
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          />
                          <Typography variant="h4" fontWeight={700} sx={{ color: riskColor }}>
                            {hotspot.riskScore}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            risk score
                          </Typography>
                        </Stack>
                      </Stack>

                      <Divider />

                      {/* Stats */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight={700} color="primary.main">
                              {hotspot.totalIncidents}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Incidents
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight={700} color="warning.main">
                              {hotspot.recentIncidents}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last 30 Days
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight={700} color="secondary.main">
                              {Object.keys(hotspot.categories).length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Categories
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Category Breakdown */}
                      <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block">
                          INCIDENT BREAKDOWN
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {Object.entries(hotspot.categories)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, count]) => (
                              <Chip
                                key={category}
                                label={`${category}: ${count}`}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                        </Stack>
                      </Box>

                      {/* Recommendations */}
                      {hotspot.recommendations && hotspot.recommendations.length > 0 && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            border: `1px dashed ${alpha(riskColor, 0.3)}`,
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} color={riskColor} mb={0.5} display="block">
                            🎯 AI RECOMMENDATIONS
                          </Typography>
                          <Stack spacing={0.5}>
                            {hotspot.recommendations.map((rec, idx) => (
                              <Typography key={idx} variant="caption" color="text.secondary">
                                • {rec}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Overall Insights */}
      {hotspotData.insights && hotspotData.insights.length > 0 && (
        <Stack spacing={2}>
          {hotspotData.insights.map((insight, index) => {
            const insightColor = 
              insight.type === 'critical' ? theme.palette.error.main :
              insight.type === 'warning' ? theme.palette.warning.main :
              theme.palette.info.main;

            return (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(insightColor, 0.08),
                  border: `1px solid ${alpha(insightColor, 0.2)}`,
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AlertTriangle size={20} color={insightColor} />
                    <Typography variant="body2" fontWeight={600} sx={{ color: insightColor }}>
                      {insight.message}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                    💡 Recommendation: {insight.recommendation}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export default HotspotAnalysis;
