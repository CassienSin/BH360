import { useState, useEffect, useMemo } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  alpha,
  useTheme,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Brain, Award, TrendingUp, Users, Target, ArrowLeft } from 'lucide-react';
import { calculateTanodPerformance, calculateTeamPerformance } from '../../services/aiService';
import TanodPerformanceCard from '../../components/ai/TanodPerformanceCard';
import { useAllTanods, useAllAttendance } from '../../hooks/useTanod';
import { useAllIncidents } from '../../hooks/useIncidents';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const PerformanceInsights = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Fetch data from Firebase
  const { data: tanodMembers = [], isLoading: loadingTanods, error: tanodsError } = useAllTanods();
  const { data: allIncidents = [], isLoading: loadingIncidents } = useAllIncidents();
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useAllAttendance();
  
  const [performances, setPerformances] = useState([]);
  const [teamStats, setTeamStats] = useState(null);

  const isLoading = loadingTanods || loadingIncidents || loadingAttendance;

  // Calculate incident responses (incidents assigned to tanods) - memoized to prevent infinite re-renders
  const incidentResponses = useMemo(() => {
    return allIncidents
      .filter(inc => inc.assignedTo)
      .map(inc => ({
        id: inc.id,
        tanodId: inc.assignedTo,
        incidentId: inc.id,
        status: inc.status,
        createdAt: inc.createdAt,
        respondedAt: inc.updatedAt,
      }));
  }, [allIncidents]);

  useEffect(() => {
    if (tanodMembers.length > 0 && !isLoading) {
      // Calculate individual performances
      const performanceData = tanodMembers
        .filter(tanod => tanod.status === 'active' || tanod.status === 'on-leave')
        .map(tanod => ({
          tanod,
          performance: calculateTanodPerformance(tanod, incidentResponses, attendanceRecords)
        }))
        .sort((a, b) => b.performance.overallScore - a.performance.overallScore);

      setPerformances(performanceData);

      // Calculate team performance
      const teamPerformance = calculateTeamPerformance(tanodMembers, incidentResponses, attendanceRecords);
      setTeamStats(teamPerformance);
    }
  }, [tanodMembers, incidentResponses, attendanceRecords, isLoading]);

  // Error state
  if (tanodsError) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Alert severity="error">
          Failed to load performance data. Please check your Firebase connection.
        </Alert>
      </Stack>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Performance Insights
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  // No data state
  if (tanodMembers.length === 0) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/tanod')}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Performance Insights
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
            Performance insights will appear once tanod members are added to the system
          </Typography>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/tanod')}
        >
          Back
        </Button>
        <Stack flexGrow={1}>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Performance Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered analysis of tanod member performance and team metrics
          </Typography>
        </Stack>
      </Stack>

      {/* Enhanced Team Overview Stats */}
      {teamStats && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Team Score
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="primary.main">
                      {teamStats.overallScore}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Out of 100
                    </Typography>
                  </Stack>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), width: 56, height: 56 }}>
                    <Target size={28} color={theme.palette.primary.main} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="success.main">
                      {teamStats.avgResponseTime}m
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Minutes
                    </Typography>
                  </Stack>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), width: 56, height: 56 }}>
                    <TrendingUp size={28} color={theme.palette.success.main} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Resolution Rate
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="info.main">
                      {teamStats.avgResolutionRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Team Average
                    </Typography>
                  </Stack>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), width: 56, height: 56 }}>
                    <Users size={28} color={theme.palette.info.main} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total Incidents
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="warning.main">
                      {teamStats.totalIncidents}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Handled
                    </Typography>
                  </Stack>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), width: 56, height: 56 }}>
                    <Award size={28} color={theme.palette.warning.main} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Enhanced AI Insights */}
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
                AI-Generated Performance Insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzing {tanodMembers.length} tanod members • Enhanced AI v2.0
              </Typography>
            </Stack>
            {teamStats?.capacityUtilization && (
              <Chip
                label={`${teamStats.capacityUtilization}% Capacity`}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                  color: theme.palette.info.main,
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Stack>

          {teamStats && teamStats.insights && (
            <Stack spacing={2}>
              {teamStats.insights.map((insight, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {insight}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Team Performance Distribution */}
      {teamStats?.performanceDistribution && (
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Team Performance Distribution
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight={700} color="success.main">
                    {teamStats.performanceDistribution.excellent}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Excellent (90+)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.info.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight={700} color="info.main">
                    {teamStats.performanceDistribution.good}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Good (70-89)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight={700} color="warning.main">
                    {teamStats.performanceDistribution.average}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average (50-69)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight={700} color="error.main">
                    {teamStats.performanceDistribution.poor}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs Help (&lt;50)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Individual Performance Cards */}
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Individual Performance Rankings
        </Typography>

        {performances.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No performance data available yet
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {performances.map(({ tanod, performance }, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={tanod.id}>
                <TanodPerformanceCard
                  tanod={tanod}
                  performance={performance}
                  rank={index + 1}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Performance Recommendations */}
      {teamStats && teamStats.recommendations && (
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Recommendations for Improvement
            </Typography>
            <Stack spacing={2}>
              {teamStats.recommendations.map((recommendation, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.2),
                        color: theme.palette.info.main,
                        fontWeight: 700,
                        minWidth: 32,
                      }}
                    />
                    <Typography variant="body1">{recommendation}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default PerformanceInsights;
