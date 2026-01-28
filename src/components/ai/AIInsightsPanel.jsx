import { Stack, Card, CardContent, Typography, Chip, Box, alpha, useTheme } from '@mui/material';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';

const AIInsightsPanel = ({ insights = [] }) => {
  const theme = useTheme();

  if (!insights || insights.length === 0) {
    return null;
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
        return <Lightbulb size={20} />;
      default:
        return <Info size={20} />;
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
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Lightbulb size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={600}>
              AI-Powered Insights
            </Typography>
            <Chip
              label="BETA"
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.7rem'
              }}
            />
          </Stack>

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
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
