import { useState, useMemo } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatDateTime, getSeverityColor } from '../../utils/tanodFormatters';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useAllTanods } from '../../hooks/useTanod';
import { useAllIncidents } from '../../hooks/useIncidents';

// Map incident priority to severity label used in this view
const priorityToSeverity = (priority) => {
  const map = { emergency: 'critical', urgent: 'high', medium: 'medium', minor: 'low', low: 'low' };
  return map[priority] || 'medium';
};

const IncidentResponseLog = () => {
  const theme = useTheme();

  const { data: tanodMembers = [], isLoading: loadingTanods } = useAllTanods();
  const { data: allIncidents = [], isLoading: loadingIncidents } = useAllIncidents();

  const [selectedTanod, setSelectedTanod] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  // Build response log rows from real incident data
  const incidentResponses = useMemo(() => {
    return allIncidents
      .filter((inc) => Boolean(inc.assignedTo))
      .map((inc) => {
        const reportedAt = inc.createdAt?.toDate ? inc.createdAt.toDate() : new Date(inc.createdAt);
        const resolvedAt = inc.resolvedAt?.toDate
          ? inc.resolvedAt.toDate()
          : inc.resolvedAt
          ? new Date(inc.resolvedAt)
          : null;
        const tanod = tanodMembers.find((t) => t.id === inc.assignedTo);
        const responseTimeMinutes = resolvedAt
          ? Math.round((resolvedAt - reportedAt) / 60000)
          : 0;
        return {
          id: inc.id,
          tanodId: inc.assignedTo,
          tanodName:
            tanod?.displayName ||
            tanod?.fullName ||
            `${tanod?.firstName || ''} ${tanod?.lastName || ''}`.trim() ||
            'Unknown Tanod',
          incidentType: inc.category || inc.title || 'Incident',
          incidentLocation: inc.location || '—',
          reportedAt,
          responseTimeMinutes,
          severity: priorityToSeverity(inc.priority),
          resolvedAt,
        };
      });
  }, [allIncidents, tanodMembers]);

  // Filter
  const filteredResponses = incidentResponses.filter((response) => {
    const matchesTanod = selectedTanod === 'all' || response.tanodId === selectedTanod;
    const matchesDate =
      response.reportedAt >= dateRange.start && response.reportedAt <= dateRange.end;
    return matchesTanod && matchesDate;
  });

  // Stats
  const totalIncidents = filteredResponses.length;
  const avgResponseTime =
    filteredResponses.length > 0
      ? filteredResponses.reduce((sum, r) => sum + r.responseTimeMinutes, 0) /
        filteredResponses.length
      : 0;
  const resolvedIncidents = filteredResponses.filter((r) => r.resolvedAt).length;
  const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

  const severityCounts = {
    low: filteredResponses.filter((r) => r.severity === 'low').length,
    medium: filteredResponses.filter((r) => r.severity === 'medium').length,
    high: filteredResponses.filter((r) => r.severity === 'high').length,
    critical: filteredResponses.filter((r) => r.severity === 'critical').length,
  };

  const columns = [
    { field: 'tanodName', headerName: 'Tanod', flex: 1, minWidth: 130 },
    { field: 'incidentType', headerName: 'Incident Type', flex: 1, minWidth: 150 },
    { field: 'incidentLocation', headerName: 'Location', flex: 1.2, minWidth: 180 },
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
      valueFormatter: (value) =>
        value > 0
          ? value < 60
            ? `${value}m`
            : `${Math.floor(value / 60)}h ${value % 60}m`
          : 'Pending',
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

  if (loadingTanods || loadingIncidents) {
    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={400} />
      </Stack>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={700}>Incident Response Log</Typography>
          <Typography variant="body2" color="text.secondary">
            Track incident responses and performance metrics
          </Typography>
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {[
            { label: 'Total Incidents', icon: AlertCircle, color: 'primary', value: totalIncidents },
            { label: 'Avg Response Time', icon: Clock, color: 'info', value: `${avgResponseTime.toFixed(1)}m` },
            { label: 'Resolved', icon: CheckCircle, color: 'success', value: resolvedIncidents },
            { label: 'Resolution Rate', icon: TrendingUp, color: 'secondary', value: `${resolutionRate.toFixed(0)}%` },
          ].map(({ label, icon: Icon, color, value }) => (
            <Box
              key={label}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}
            >
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette[color].main, 0.05) }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon size={20} color={theme.palette[color].main} />
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={700} color={`${color}.main`}>{value}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>

        {/* Severity Breakdown */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Incidents by Severity</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {Object.entries(severityCounts).map(([severity, count]) => (
                <Box key={severity} sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(25% - 12px)' } }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                        {severity}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>{count}</Typography>
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
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Incident Log Table */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h6" fontWeight={600}>Incident Responses</Typography>
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
                          {tanod.displayName ||
                            tanod.fullName ||
                            `${tanod.firstName || ''} ${tanod.lastName || ''}`.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={dateRange.end}
                    onChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
              </Stack>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={filteredResponses}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  disableRowSelectionOnClick
                  sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
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
