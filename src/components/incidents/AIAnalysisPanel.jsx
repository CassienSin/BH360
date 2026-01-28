import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  alpha,
  useTheme,
  Divider,
  LinearProgress,
} from '@mui/material';
import { Sparkles, TrendingUp, Target, Lightbulb } from 'lucide-react';

const AIAnalysisPanel = ({ incident }) => {
  const theme = useTheme();
  const { aiClassification, aiPriority, aiSuggestions } = incident;

  if (!aiClassification && !aiPriority) {
    return null;
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.02
        )} 100%)`,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Sparkles size={20} />
            </Box>
            <Stack>
              <Typography variant="h6" fontWeight={700}>
                AI Analysis
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Powered by intelligent incident classification
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          {/* Classification */}
          {aiClassification && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Target size={18} color={theme.palette.text.secondary} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Classification
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Chip
                    label={aiClassification.category}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  />
                </Stack>
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Confidence Level
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                      {aiClassification.confidence}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={aiClassification.confidence}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                </Stack>
                {aiClassification.suggestedCategories && aiClassification.suggestedCategories.length > 0 && (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Alternative Categories
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {aiClassification.suggestedCategories.slice(0, 3).map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
                            borderColor: alpha(theme.palette.text.secondary, 0.2),
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}

          {/* Priority Score */}
          {aiPriority && (
            <>
              <Divider />
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUp size={18} color={theme.palette.text.secondary} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Priority Score
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      AI Calculated Score
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color={theme.palette.warning.main}>
                      {aiPriority.score}/100
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={aiPriority.score}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor:
                          aiPriority.score >= 70
                            ? theme.palette.error.main
                            : aiPriority.score >= 40
                            ? theme.palette.warning.main
                            : theme.palette.info.main,
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Recommended Priority
                    </Typography>
                    <Chip
                      label={aiPriority.priority}
                      size="small"
                      sx={{
                        backgroundColor: alpha(
                          aiPriority.priority === 'emergency'
                            ? theme.palette.error.main
                            : aiPriority.priority === 'urgent'
                            ? theme.palette.warning.main
                            : theme.palette.info.main,
                          0.1
                        ),
                        color:
                          aiPriority.priority === 'emergency'
                            ? theme.palette.error.main
                            : aiPriority.priority === 'urgent'
                            ? theme.palette.warning.main
                            : theme.palette.info.main,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Stack>
                </Stack>

                {aiPriority.factors && (
                  <Stack
                    spacing={1}
                    p={2}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.grey[500], 0.05),
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Score Breakdown
                    </Typography>
                    <Stack spacing={0.5}>
                      {Object.entries(aiPriority.factors).map(([factor, value]) => (
                        <Stack key={factor} direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            +{value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </>
          )}

          {/* Response Suggestions */}
          {aiSuggestions && aiSuggestions.length > 0 && (
            <>
              <Divider />
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Lightbulb size={18} color={theme.palette.text.secondary} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Suggested Actions ({aiSuggestions.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {aiSuggestions.slice(0, 5).map((suggestion, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      p={1.5}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: suggestion.urgent
                          ? alpha(theme.palette.error.main, 0.05)
                          : alpha(theme.palette.grey[500], 0.05),
                        border: `1px solid ${
                          suggestion.urgent
                            ? alpha(theme.palette.error.main, 0.2)
                            : alpha(theme.palette.grey[500], 0.1)
                        }`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          minWidth: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: suggestion.urgent ? theme.palette.error.main : theme.palette.info.main,
                          mt: 0.8,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {suggestion.action}
                      </Typography>
                      {suggestion.urgent && (
                        <Chip label="Urgent" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AIAnalysisPanel;
