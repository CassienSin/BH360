import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AlertCircle, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector } from 'react-redux';
import { formatDateTime, formatResponseTime, getSeverityColor } from '../../utils/tanodFormatters';
import { startOfMonth, endOfMonth } from 'date-fns';

const IncidentResponseLog = () => {
  const theme = useTheme();
  const { tanodMembers, incidentResponses } = useSelector((state) => state.tanod);

  const [selectedTanod, setSelectedTanod] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  // Filter responses
  const filteredResponses = incidentResponses.filter((response) => {
    const responseDate = new Date(response.reportedAt);
    const matchesTanod = selectedTanod === 'all' || response.tanodId === selectedTanod;
    const matchesDate = responseDate >= dateRange.start && responseDate <= dateRange.end;
    return matchesTanod && matchesDate;
  });

  // Calculate stats
  const totalIncidents = filteredResponses.length;
  const avgResponseTime =
    filteredResponses.length > 0
      ? filteredResponses.reduce((sum, r) => sum + r.responseTimeMinutes, 0) /
        filteredResponses.length
      : 0;
  const resolvedIncidents = filteredResponses.filter((r) => r.resolvedAt).length;
  const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

  // Severity breakdown
  const severityCounts = {
    low: filteredResponses.filter((r) => r.severity === 'low').length,
    medium: filteredResponses.filter((r) => r.severity === 'medium').length,
    high: filteredResponses.filter((r) => r.severity === 'high').length,
    critical: filteredResponses.filter((r) => r.severity === 'critical').length,
  };

  const columns = [
    {
      field: 'tanodName',
      headerName: 'Tanod',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'incidentType',
      headerName: 'Incident Type',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'incidentLocation',
      headerName: 'Location',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'reportedAt',
      headerName: 'Reported',
      flex: 1,
      minWidth: 140,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'responseTimeMinutes',
      headerName: 'Response Time',
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (value) => formatResponseTime(value),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            textTransform: 'capitalize',
            bgcolor: alpha(getSeverityColor(params.value, theme), 0.1),
            color: getSeverityColor(params.value, theme),
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'resolvedAt',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Resolved' : 'Pending'}
          size="small"
          color={params.value ? 'success' : 'warning'}
          icon={params.value ? <CheckCircle size={14} /> : <Clock size={14} />}
        />
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={700}>
            Incident Response Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track incident responses and performance metrics
          </Typography>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AlertCircle size={20} color={theme.palette.primary.main} />
                    <Typography variant="body2" color="text.secondary">
                      Total Incidents
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {totalIncidents}
                  </Typography>
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
                bgcolor: alpha(theme.palette.info.main, 0.05),
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Clock size={20} color={theme.palette.info.main} />
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {avgResponseTime.toFixed(1)}m
                  </Typography>
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
                bgcolor: alpha(theme.palette.success.main, 0.05),
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircle size={20} color={theme.palette.success.main} />
                    <Typography variant="body2" color="text.secondary">
                      Resolved
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {resolvedIncidents}
                  </Typography>
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
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TrendingUp size={20} color={theme.palette.secondary.main} />
                    <Typography variant="body2" color="text.secondary">
                      Resolution Rate
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color="secondary.main">
                    {resolutionRate.toFixed(0)}%
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Severity Breakdown */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Incidents by Severity
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(severityCounts).map(([severity, count]) => (
                <Grid size={{ xs: 6, sm: 3 }} key={severity}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                        {severity}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={totalIncidents > 0 ? (count / totalIncidents) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(getSeverityColor(severity, theme), 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getSeverityColor(severity, theme),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Incident Log Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h6" fontWeight={600}>
                  Incident Responses
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Tanod Member</InputLabel>
                    <Select
                      value={selectedTanod}
                      onChange={(e) => setSelectedTanod(e.target.value)}
                      label="Tanod Member"
                    >
                      <MenuItem value="all">All Members</MenuItem>
                      {tanodMembers.map((tanod) => (
                        <MenuItem key={tanod.id} value={tanod.id}>
                          {tanod.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
                    slotProps={{
                      textField: { size: 'small' },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={dateRange.end}
                    onChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
                    slotProps={{
                      textField: { size: 'small' },
                    }}
                  />
                </Stack>
              </Stack>

              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={filteredResponses}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableRowSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
};

export default IncidentResponseLog;
