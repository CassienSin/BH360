import { Stack, Card, CardContent, Typography, Box, Chip, alpha, useTheme, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, Activity, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const PredictiveAnalytics = ({ predictions, incidents }) => {
  const theme = useTheme();

  if (!predictions || predictions.trend === 'insufficient_data') {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            Insufficient data for predictions. Need at least 7 days of incident history.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend.includes('increasing')) return <TrendingUp size={20} />;
    if (trend.includes('decreasing')) return <TrendingDown size={20} />;
    return <Activity size={20} />;
  };

  const getTrendColor = (trend) => {
    if (trend.includes('increasing_significantly')) return theme.palette.error.main;
    if (trend.includes('increasing')) return theme.palette.warning.main;
    if (trend.includes('decreasing')) return theme.palette.success.main;
    return theme.palette.info.main;
  };

  const trendColor = getTrendColor(predictions.trend);

  // Prepare chart data
  const chartData = predictions.predictions.map(pred => ({
    date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: pred.predictedCount,
    confidence: pred.confidence
  }));

  return (
    <Stack spacing={3}>
      {/* Trend Summary */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(trendColor, 0.3)}`,
              background: `linear-gradient(135deg, ${alpha(trendColor, 0.08)} 0%, ${alpha(trendColor, 0.03)} 100%)`,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ color: trendColor }}>
                    {getTrendIcon(predictions.trend)}
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Trend Analysis
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Current Average
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: trendColor }}>
                      {predictions.currentAverage}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Trend Direction
                    </Typography>
                    <Chip
                      icon={getTrendIcon(predictions.trend)}
                      label={predictions.trend.replace(/_/g, ' ').toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: alpha(trendColor, 0.15),
                        color: trendColor,
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Change Rate
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: trendColor }}>
                      {predictions.trendPercentage > 0 ? '+' : ''}{predictions.trendPercentage}%
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Confidence Level
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box
                        sx={{
                          width: 60,
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${predictions.confidence}%`,
                            height: '100%',
                            backgroundColor: theme.palette.primary.main,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" fontWeight={600}>
                        {predictions.confidence}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    7-Day Forecast
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  {predictions.predictions.slice(0, 3).map((pred, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(pred.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pred.confidence}% confidence
                          </Typography>
                        </Stack>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {pred.predictedCount}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ pt: 1 }}>
                    Estimated incidents per day
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Forecast Chart */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Predicted Incident Volume
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="date" 
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8
                }}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke={theme.palette.primary.main} 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPredicted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {predictions.insights && predictions.insights.length > 0 && (
        <Stack spacing={2}>
          {predictions.insights.map((insight, index) => {
            const insightColor = 
              insight.type === 'warning' ? theme.palette.error.main :
              insight.type === 'positive' ? theme.palette.success.main :
              insight.type === 'info' ? theme.palette.info.main :
              theme.palette.grey[600];

            const insightIcon = 
              insight.type === 'warning' ? <AlertTriangle size={20} /> :
              insight.type === 'positive' ? <CheckCircle size={20} /> :
              <Activity size={20} />;

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
                    <Box sx={{ color: insightColor }}>
                      {insightIcon}
                    </Box>
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

export default PredictiveAnalytics;
