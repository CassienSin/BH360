import { Stack, Card, CardContent, Typography, Box, Chip, LinearProgress, alpha, useTheme, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, Star, Award, AlertTriangle, CheckCircle } from 'lucide-react';

const TanodPerformanceCard = ({ tanod, performance }) => {
  const theme = useTheme();

  if (!performance) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 75) return theme.palette.info.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? theme.palette.warning.main : 'none'}
        color={i < rating ? theme.palette.warning.main : theme.palette.grey[300]}
      />
    ));
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(getScoreColor(performance.performanceScore), 0.05)} 0%, ${alpha(getScoreColor(performance.performanceScore), 0.02)} 100%)`,
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {tanod.fullName}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {renderStars(performance.rating)}
                <Typography variant="caption" color="text.secondary" ml={0.5}>
                  ({performance.rating.toFixed(1)})
                </Typography>
              </Stack>
            </Stack>
            <Box>
              <Chip
                icon={<Award size={14} />}
                label={`${performance.performanceScore}%`}
                sx={{
                  backgroundColor: alpha(getScoreColor(performance.performanceScore), 0.15),
                  color: getScoreColor(performance.performanceScore),
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              />
            </Box>
          </Stack>

          {/* Performance Score Bar */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Overall Performance
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: getScoreColor(performance.performanceScore) }}>
                {performance.performanceScore}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={performance.performanceScore}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: alpha(getScoreColor(performance.performanceScore), 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(performance.performanceScore),
                  borderRadius: 1,
                }
              }}
            />
          </Box>

          {/* Metrics Grid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Resolution Rate
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {performance.metrics.resolutionRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {performance.metrics.resolvedIncidents}/{performance.metrics.totalResponses} resolved
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Attendance
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {performance.metrics.attendanceRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {performance.metrics.completedShifts}/{performance.metrics.totalShifts} shifts
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Avg Response Time
                </Typography>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {performance.metrics.avgResponseTime}m
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  minutes
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.warning.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total Responses
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {performance.metrics.totalResponses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  incidents
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Strengths */}
          {performance.strengths.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <TrendingUp size={16} color={theme.palette.success.main} />
                <Typography variant="caption" fontWeight={700} color="success.main">
                  STRENGTHS
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                {performance.strengths.map((strength, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <CheckCircle size={14} color={theme.palette.success.main} />
                    <Typography variant="caption" color="text.secondary">
                      {strength}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* Areas for Improvement */}
          {performance.improvements.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <TrendingDown size={16} color={theme.palette.warning.main} />
                <Typography variant="caption" fontWeight={700} color="warning.main">
                  AREAS FOR IMPROVEMENT
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                {performance.improvements.map((improvement, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <AlertTriangle size={14} color={theme.palette.warning.main} />
                    <Typography variant="caption" color="text.secondary">
                      {improvement}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* AI Insights */}
          {performance.insights.length > 0 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Typography variant="caption" fontWeight={700} color="primary.main" mb={0.5} display="block">
                💡 AI RECOMMENDATIONS
              </Typography>
              {performance.insights.map((insight, index) => (
                <Typography key={index} variant="caption" color="text.secondary" display="block" mb={0.5}>
                  • {insight.recommendation}
                </Typography>
              ))}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TanodPerformanceCard;
