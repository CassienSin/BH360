import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Avatar
} from '@mui/material';
import { Brain, Award, TrendingUp, Users, Target } from 'lucide-react';
import { calculateTanodPerformance, calculateTeamPerformance } from '../../services/aiService';
import TanodPerformanceCard from '../../components/ai/TanodPerformanceCard';

// Mock data for demo purposes
const mockIncidentResponses = [
  {
    id: '1',
    tanodId: '1',
    incidentId: 'inc-1',
    status: 'resolved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    respondedAt: new Date(Date.now() - 86100000).toISOString(),
  },
  {
    id: '2',
    tanodId: '1',
    incidentId: 'inc-2',
    status: 'resolved',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    respondedAt: new Date(Date.now() - 172200000).toISOString(),
  },
  {
    id: '3',
    tanodId: '2',
    incidentId: 'inc-3',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    respondedAt: new Date(Date.now() - 257400000).toISOString(),
  },
  {
    id: '4',
    tanodId: '1',
    incidentId: 'inc-4',
    status: 'resolved',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    respondedAt: new Date(Date.now() - 344400000).toISOString(),
  },
  {
    id: '5',
    tanodId: '3',
    incidentId: 'inc-5',
    status: 'resolved',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    respondedAt: new Date(Date.now() - 430800000).toISOString(),
  },
];

const mockAttendanceRecords = [
  {
    id: '1',
    tanodId: '1',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
  },
  {
    id: '2',
    tanodId: '1',
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
  },
  {
    id: '3',
    tanodId: '1',
    date: new Date(Date.now() - 259200000).toISOString(),
    status: 'completed',
  },
  {
    id: '4',
    tanodId: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'late',
  },
  {
    id: '5',
    tanodId: '2',
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
  },
  {
    id: '6',
    tanodId: '3',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
  },
];

const PerformanceInsights = () => {
  const theme = useTheme();
  const { tanodMembers, incidentResponses, attendanceRecords } = useSelector((state) => state.tanod);
  const [performances, setPerformances] = useState([]);
  const [teamStats, setTeamStats] = useState(null);

  // Use mock data if no real data
  const responsesData = incidentResponses.length > 0 ? incidentResponses : mockIncidentResponses;
  const attendanceData = attendanceRecords.length > 0 ? attendanceRecords : mockAttendanceRecords;

  useEffect(() => {
    if (tanodMembers.length > 0) {
      // Calculate individual performances
      const performanceData = tanodMembers
        .filter(tanod => tanod.status === 'active')
        .map(tanod => ({
          tanod,
          performance: calculateTanodPerformance(tanod, responsesData, attendanceData)
        }))
        .sort((a, b) => b.performance.performanceScore - a.performance.performanceScore);

      setPerformances(performanceData);

      // Calculate team performance
      const teamPerformance = calculateTeamPerformance(tanodMembers, responsesData, attendanceData);
      setTeamStats(teamPerformance);
    }
  }, [tanodMembers, responsesData, attendanceData]);

  return (
    <Stack spacing={3} className="animate-fade-in">
      {/* Header */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Performance Insights
          </Typography>
          <Chip
            icon={<Brain size={16} />}
            label="AI-Powered Analytics"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          AI-driven performance analysis and recommendations for Tanod members
        </Typography>
      </Stack>

      {/* Team Overview Stats */}
      {teamStats && (
        <>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Users size={24} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    Team Performance Overview
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Target size={18} color={theme.palette.primary.main} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          AVG PERFORMANCE
                        </Typography>
                      </Stack>
                      <Typography variant="h3" fontWeight={700} color="primary.main">
                        {teamStats.avgPerformanceScore}%
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <TrendingUp size={18} color={theme.palette.success.main} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          RESOLUTION RATE
                        </Typography>
                      </Stack>
                      <Typography variant="h3" fontWeight={700} color="success.main">
                        {teamStats.avgResolutionRate}%
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Award size={18} color={theme.palette.info.main} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          ATTENDANCE
                        </Typography>
                      </Stack>
                      <Typography variant="h3" fontWeight={700} color="info.main">
                        {teamStats.avgAttendanceRate}%
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Users size={18} color={theme.palette.warning.main} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          TEAM SIZE
                        </Typography>
                      </Stack>
                      <Typography variant="h3" fontWeight={700} color="warning.main">
                        {teamStats.teamSize}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Top Performers */}
          {teamStats.topPerformers && teamStats.topPerformers.length > 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Award size={20} color={theme.palette.warning.main} />
                    <Typography variant="h6" fontWeight={600}>
                      Top Performers
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    {teamStats.topPerformers.map((performer, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.warning.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: theme.palette.warning.main,
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.5rem'
                              }}
                            >
                              #{index + 1}
                            </Avatar>
                            <Stack flexGrow={1}>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {performer.name}
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="warning.main">
                                {performer.score}% ⭐ {performer.rating}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Members Needing Attention */}
          {teamStats.needsAttention && teamStats.needsAttention.length > 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.warning.main, 0.03),
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUp size={20} color={theme.palette.warning.main} />
                    <Typography variant="h6" fontWeight={600}>
                      Members Needing Attention
                    </Typography>
                  </Stack>

                  <Stack spacing={1.5}>
                    {teamStats.needsAttention.map((member, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight={600}>
                              {member.name}
                            </Typography>
                            <Chip
                              label={`${member.score}%`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                          <Stack spacing={0.5}>
                            {member.issues.map((issue, idx) => (
                              <Typography key={idx} variant="caption" color="text.secondary">
                                • {issue}
                              </Typography>
                            ))}
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          <Divider />
        </>
      )}

      {/* Individual Performance Cards */}
      <Stack spacing={1}>
        <Typography variant="h5" fontWeight={600}>
          Individual Performance Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Detailed AI-powered performance metrics for each Tanod member
        </Typography>
      </Stack>

      {performances.length > 0 ? (
        <Grid container spacing={3}>
          {performances.map(({ tanod, performance }) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={tanod.id}>
              <TanodPerformanceCard tanod={tanod} performance={performance} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No active Tanod members found. Add Tanod members to see performance insights.
          </Typography>
        </Card>
      )}
    </Stack>
  );
};

export default PerformanceInsights;
