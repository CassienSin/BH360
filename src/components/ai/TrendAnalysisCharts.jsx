import { Stack, Card, CardContent, Typography, Box, Grid, useTheme, alpha } from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapPin, Clock, TrendingUp } from 'lucide-react';

const TrendAnalysisCharts = ({ trendData }) => {
  const theme = useTheme();

  if (!trendData) {
    return null;
  }

  const { frequentAreas, categoryTrends, timePatterns, monthlyTrend } = trendData;

  // Colors for charts
  const COLORS = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.secondary.main,
    theme.palette.primary.main,
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {/* Frequent Areas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MapPin size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    Incident Hotspots
                  </Typography>
                </Stack>

                {frequentAreas && frequentAreas.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={frequentAreas.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis type="number" stroke={theme.palette.text.secondary} />
                      <YAxis
                        type="category"
                        dataKey="area"
                        stroke={theme.palette.text.secondary}
                        width={120}
                        style={{ fontSize: '0.75rem' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8
                        }}
                      />
                      <Bar dataKey="count" fill={theme.palette.error.main} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No data available
                  </Typography>
                )}

                {frequentAreas && frequentAreas.length > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} color="error.main">
                      Top Hotspot: {frequentAreas[0].area}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {frequentAreas[0].count} incidents ({frequentAreas[0].percentage}% of total)
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUp size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    Incident Categories
                  </Typography>
                </Stack>

                {categoryTrends && categoryTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryTrends}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.category}: ${entry.percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No data available
                  </Typography>
                )}

                {categoryTrends && categoryTrends.length > 0 && (
                  <Stack spacing={1}>
                    {categoryTrends.slice(0, 3).map((cat, index) => (
                      <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                          <Typography variant="caption" textTransform="capitalize">
                            {cat.category}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" fontWeight={600}>
                          {cat.count} ({cat.percentage}%)
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Clock size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    Peak Incident Hours
                  </Typography>
                </Stack>

                {timePatterns && timePatterns.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={timePatterns}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                          dataKey="hour"
                          stroke={theme.palette.text.secondary}
                          tickFormatter={(hour) => `${hour}:00`}
                        />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8
                          }}
                          labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                        />
                        <Bar dataKey="count" fill={theme.palette.info.main} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      }}
                    >
                      <Typography variant="caption" fontWeight={600} color="info.main">
                        Peak Time: {timePatterns[0].hour}:00 - {timePatterns[0].hour + 1}:00
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {timePatterns[0].count} incidents during this hour
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No data available
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUp size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    Monthly Trend
                  </Typography>
                </Stack>

                {monthlyTrend && monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8
                        }}
                      />
                      <Bar dataKey="count" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No data available
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default TrendAnalysisCharts;
