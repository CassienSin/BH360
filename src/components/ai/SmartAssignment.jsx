import { Stack, Card, CardContent, Typography, Box, Chip, alpha, useTheme, Avatar, Divider, LinearProgress } from '@mui/material';
import { Users, Award, MapPin, Clock, Target, Star, CheckCircle } from 'lucide-react';

const SmartAssignment = ({ assignmentData, incident }) => {
  const theme = useTheme();

  if (!assignmentData || assignmentData.noAvailableMembers) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack spacing={2} alignItems="center" py={3}>
            <Users size={48} color={theme.palette.text.secondary} />
            <Typography variant="h6" fontWeight={600}>
              No Available Tanod Members
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {assignmentData.offDutyCount > 0 
                ? `${assignmentData.offDutyCount} member(s) are currently off-duty`
                : 'All Tanod members are currently unavailable'
              }
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { recommendations, topChoice, insights } = assignmentData;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return theme.palette.success.main;
    if (confidence >= 60) return theme.palette.info.main;
    if (confidence >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Stack spacing={3}>
      {/* Top Choice Highlight */}
      {topChoice && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `2px solid ${alpha(theme.palette.success.main, 0.4)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(
              theme.palette.success.main,
              0.05
            )} 100%)`,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Award size={24} color={theme.palette.success.main} />
                <Typography variant="h6" fontWeight={700} color="success.main">
                  Best Match
                </Typography>
                <Chip
                  label="AI RECOMMENDED"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    color: theme.palette.success.main,
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    color: theme.palette.success.main,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}
                >
                  {topChoice.tanod.fullName?.charAt(0) || topChoice.tanod.displayName?.charAt(0) || '?'}
                </Avatar>

                <Stack flexGrow={1}>
                  <Typography variant="h5" fontWeight={700}>
                    {topChoice.tanod.fullName || topChoice.tanod.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {topChoice.matchReason}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {topChoice.tanod.assignedAreas?.slice(0, 3).map((area, idx) => (
                      <Chip
                        key={idx}
                        icon={<MapPin size={12} />}
                        label={area}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>

                <Stack alignItems="flex-end" spacing={0.5}>
                  <Typography variant="h3" fontWeight={700} color="success.main">
                    {topChoice.confidence}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    match score
                  </Typography>
                  <Box sx={{ width: 80 }}>
                    <LinearProgress
                      variant="determinate"
                      value={topChoice.confidence}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.success.main, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main,
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>

              {/* Key Factors */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="success.main" mb={1} display="block">
                  🎯 MATCH FACTORS
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {topChoice.factors.location >= 20 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MapPin size={14} color={theme.palette.success.main} />
                      <Typography variant="caption">Location: {topChoice.factors.location}pts</Typography>
                    </Stack>
                  )}
                  {topChoice.factors.expertise >= 15 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Star size={14} color={theme.palette.success.main} />
                      <Typography variant="caption">Expertise: {topChoice.factors.expertise}pts</Typography>
                    </Stack>
                  )}
                  {topChoice.factors.performance >= 15 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Award size={14} color={theme.palette.success.main} />
                      <Typography variant="caption">Performance: {topChoice.factors.performance}pts</Typography>
                    </Stack>
                  )}
                  {topChoice.factors.workload >= 10 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Target size={14} color={theme.palette.success.main} />
                      <Typography variant="caption">Availability: {topChoice.factors.workload}pts</Typography>
                    </Stack>
                  )}
                  {topChoice.factors.responseTime >= 8 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Clock size={14} color={theme.palette.success.main} />
                      <Typography variant="caption">Response: {topChoice.factors.responseTime}pts</Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Alternative Recommendations */}
      {recommendations.length > 1 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Alternative Options
            </Typography>

            <Stack spacing={2}>
              {recommendations.slice(1, 5).map((rec, index) => {
                const confidenceColor = getConfidenceColor(rec.confidence);
                
                return (
                  <Card
                    key={index}
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(confidenceColor, 0.2)}`,
                      background: alpha(confidenceColor, 0.03),
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center" flexGrow={1}>
                          <Chip
                            label={`#${rec.rank}`}
                            size="small"
                            sx={{
                              backgroundColor: alpha(confidenceColor, 0.15),
                              color: confidenceColor,
                              fontWeight: 700,
                              minWidth: 36
                            }}
                          />
                          
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: alpha(confidenceColor, 0.2),
                              color: confidenceColor,
                              fontSize: '1rem',
                              fontWeight: 700
                            }}
                          >
                            {rec.tanod.fullName?.charAt(0) || rec.tanod.displayName?.charAt(0) || '?'}
                          </Avatar>

                          <Stack>
                            <Typography variant="body1" fontWeight={600}>
                              {rec.tanod.fullName || rec.tanod.displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.matchReason}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Typography variant="h5" fontWeight={700} sx={{ color: confidenceColor }}>
                            {rec.confidence}
                          </Typography>
                          <Box sx={{ width: 60 }}>
                            <LinearProgress
                              variant="determinate"
                              value={rec.confidence}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                backgroundColor: alpha(confidenceColor, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: confidenceColor,
                                  borderRadius: 1,
                                }
                              }}
                            />
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Stack spacing={2}>
          {insights.map((insight, index) => {
            const insightColor = 
              insight.type === 'success' ? theme.palette.success.main :
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
                    <CheckCircle size={20} color={insightColor} />
                    <Typography variant="body2" fontWeight={600} sx={{ color: insightColor }}>
                      {insight.message}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                    💡 {insight.recommendation}
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

export default SmartAssignment;
