import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { formatDateTime, formatDutyHours, getStatusColor } from '../../utils/tanodFormatters';
import { startOfMonth, endOfMonth } from 'date-fns';
import {
  useAllTanods,
  useAllAttendance,
  useRecordAttendance,
  useCheckoutAttendance,
} from '../../hooks/useTanod';

const AttendanceLogger = () => {
  const theme = useTheme();

  const { data: tanodMembers = [], isLoading: loadingTanods } = useAllTanods();
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useAllAttendance();
  const recordAttendance = useRecordAttendance();
  const checkoutAttendance = useCheckoutAttendance();

  const [selectedTanod, setSelectedTanod] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  // Show all tanod members — status field may not exist on all user documents,
  // so filtering by status === 'active' would produce an empty list.
  const activeTanod = tanodMembers.filter((t) => t.status !== 'inactive');

  const handleClockIn = async () => {
    if (selectedTanod === 'all') {
      toast.warning('Please select a tanod member to clock in');
      return;
    }

    const tanod = tanodMembers.find((t) => t.id === selectedTanod);
    const today = new Date().toDateString();
    const existingRecord = attendanceRecords.find((r) => {
      const recordDate = r.date?.toDate ? r.date.toDate() : new Date(r.date);
      return r.tanodId === selectedTanod && recordDate.toDateString() === today && !r.checkOutTime;
    });

    if (existingRecord) {
      toast.warning('Already clocked in for today');
      return;
    }

    try {
      await recordAttendance.mutateAsync({
        tanodId: selectedTanod,
        tanodName:
          tanod?.displayName ||
          tanod?.fullName ||
          `${tanod?.firstName || ''} ${tanod?.lastName || ''}`.trim(),
        date: new Date(),
        shift: new Date().getHours() < 18 ? 'day' : 'night',
        status: 'on-duty',
        notes: '',
      });
    } catch (err) {
      console.error('[AttendanceLogger] clock-in error:', err);
    }
  };

  const handleClockOut = async () => {
    if (selectedTanod === 'all') {
      toast.warning('Please select a tanod member to clock out');
      return;
    }

    const tanod = tanodMembers.find((t) => t.id === selectedTanod);
    const today = new Date().toDateString();
    const activeRecord = attendanceRecords.find((r) => {
      const recordDate = r.date?.toDate ? r.date.toDate() : new Date(r.date);
      return r.tanodId === selectedTanod && recordDate.toDateString() === today && !r.checkOutTime;
    });

    if (!activeRecord) {
      toast.warning('No active clock-in found for today');
      return;
    }

    try {
      await checkoutAttendance.mutateAsync({
        attendanceId: activeRecord.id,
        checkOutTime: new Date(),
      });
      toast.success(
        `${tanod?.displayName || tanod?.fullName || 'Tanod'} clocked out successfully`
      );
    } catch (err) {
      console.error('[AttendanceLogger] clock-out error:', err);
    }
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = record.date?.toDate ? record.date.toDate() : new Date(record.date);
    const matchesTanod = selectedTanod === 'all' || record.tanodId === selectedTanod;
    const matchesDate = recordDate >= dateRange.start && recordDate <= dateRange.end;
    return matchesTanod && matchesDate;
  });

  // Stats
  const totalPresent = filteredRecords.filter((r) => r.status === 'present').length;
  const totalLate = filteredRecords.filter((r) => r.status === 'late').length;
  const totalOnDuty = filteredRecords.filter((r) => r.status === 'on-duty').length;
  const totalHours = filteredRecords.reduce((sum, r) => sum + (r.duration ? r.duration / 60 : 0), 0);
  const avgHours = filteredRecords.length > 0 ? totalHours / filteredRecords.length : 0;

  const safeDate = (value) => {
    if (!value) return null;
    return value?.toDate ? value.toDate() : new Date(value);
  };

  const columns = [
    { field: 'tanodName', headerName: 'Tanod Member', flex: 1, minWidth: 150 },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => {
        const d = safeDate(value);
        return d ? formatDateTime(d).split(' ')[0] : '-';
      },
    },
    {
      field: 'checkInTime',
      headerName: 'Clock In',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => {
        const d = safeDate(value);
        return d ? formatDateTime(d).split(' ')[1] : '-';
      },
    },
    {
      field: 'checkOutTime',
      headerName: 'Clock Out',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => {
        const d = safeDate(value);
        return d ? formatDateTime(d).split(' ')[1] : '-';
      },
    },
    {
      field: 'duration',
      headerName: 'Total Hours',
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (value) => formatDutyHours(value ? value / 60 : null),
    },
    {
      field: 'shift',
      headerName: 'Shift',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || '-'}
          size="small"
          sx={{
            textTransform: 'capitalize',
            bgcolor: alpha(
              params.value === 'day' ? theme.palette.primary.main : theme.palette.secondary.main,
              0.1
            ),
            color:
              params.value === 'day' ? theme.palette.primary.main : theme.palette.secondary.main,
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={(params.value || '-').replace('-', ' ')}
          size="small"
          sx={{
            textTransform: 'capitalize',
            bgcolor: alpha(getStatusColor(params.value, theme), 0.1),
            color: getStatusColor(params.value, theme),
          }}
        />
      ),
    },
  ];

  if (loadingTanods || loadingAttendance) {
    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>Attendance Logger</Typography>
            <Typography variant="body2" color="text.secondary">
              Track duty hours and attendance records
            </Typography>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {[
            { label: 'Present', value: totalPresent, color: 'success' },
            { label: 'Late', value: totalLate, color: 'warning' },
            { label: 'On Duty', value: totalOnDuty, color: 'info' },
            { label: 'Avg Hours/Day', value: avgHours.toFixed(1), color: 'primary' },
          ].map(({ label, value, color }) => (
            <Box
              key={label}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette[color].main, 0.05),
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
                      {value}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>

        {/* Clock In/Out Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
              <Box sx={{ flex: 1, width: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel>Select Tanod Member</InputLabel>
                  <Select
                    value={selectedTanod}
                    onChange={(e) => setSelectedTanod(e.target.value)}
                    label="Select Tanod Member"
                  >
                    <MenuItem value="all">All Members</MenuItem>
                    {activeTanod.map((tanod) => (
                      <MenuItem key={tanod.id} value={tanod.id}>
                        {tanod.displayName ||
                          tanod.fullName ||
                          `${tanod.firstName || ''} ${tanod.lastName || ''}`.trim()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, width: '100%' }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<LogIn size={20} />}
                    onClick={handleClockIn}
                    color="success"
                    disabled={recordAttendance.isPending}
                  >
                    Clock In
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<LogOut size={20} />}
                    onClick={handleClockOut}
                    color="error"
                    disabled={checkoutAttendance.isPending}
                  >
                    Clock Out
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Filters & Records */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h6" fontWeight={600}>Attendance Records</Typography>
                <Stack direction="row" spacing={2}>
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
                  rows={filteredRecords}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  disableRowSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
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

export default AttendanceLogger;
