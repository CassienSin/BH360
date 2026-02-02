import { Stack, Card, CardContent, Typography, Chip, Box, alpha, useTheme } from '@mui/material';
import { Lightbulb, TrendingUp, AlertTriangle, Info, CheckCircle, Activity } from 'lucide-react';

const AIInsightsPanel = ({ insights = [] }) => {
  const theme = useTheme();

  if (!insights || insights.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No insights available yet. AI insights will appear as more data is collected.
        </Typography>
      </Box>
    );
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'hotspot':
        return <AlertTriangle size={20} />;
      case 'category':
        return <TrendingUp size={20} />;
      case 'time':
        return <Info size={20} />;
      case 'excellent':
      case 'positive':
        return <CheckCircle size={20} />;
      case 'warning':
      case 'critical':
        return <AlertTriangle size={20} />;
      case 'info':
      case 'neutral':
        return <Info size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Stack spacing={2}>
      {insights.map((insight, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(getSeverityColor(insight.severity), 0.08),
            border: `1px solid ${alpha(getSeverityColor(insight.severity), 0.2)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: getSeverityColor(insight.severity) }}>
                {getInsightIcon(insight.type)}
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: getSeverityColor(insight.severity) }}
              >
                {insight.message}
              </Typography>
            </Stack>
            {insight.recommendation && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                💡 Recommendation: {insight.recommendation}
              </Typography>
            )}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default AIInsightsPanel;
