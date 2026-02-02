import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Clock, LogIn, LogOut, Calendar, TrendingUp } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { addAttendanceRecord, updateAttendanceRecord } from '../../store/slices/tanodSlice';
import { toast } from 'react-toastify';
import { formatDateTime, formatDutyHours, getStatusColor } from '../../utils/tanodFormatters';
import { startOfMonth, endOfMonth } from 'date-fns';

const AttendanceLogger = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { tanodMembers, attendanceRecords } = useSelector((state) => state.tanod);

  const [selectedTanod, setSelectedTanod] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  const activeTanod = tanodMembers.filter((t) => t.status === 'active');

  const handleClockIn = () => {
    if (selectedTanod === 'all') {
      toast.warning('Please select a tanod member to clock in');
      return;
    }

    const tanod = tanodMembers.find((t) => t.id === selectedTanod);
    const existingRecord = attendanceRecords.find(
      (r) =>
        r.tanodId === selectedTanod &&
        new Date(r.date).toDateString() === new Date().toDateString() &&
        !r.clockOut
    );

    if (existingRecord) {
      toast.warning('Already clocked in for today');
      return;
    }

    const newRecord = {
      id: `att-${Date.now()}`,
      tanodId: selectedTanod,
      tanodName: tanod.fullName,
      date: new Date(),
      clockIn: new Date(),
      clockOut: null,
      totalHours: null,
      shift: new Date().getHours() < 18 ? 'day' : 'night',
      status: 'on-duty',
      notes: '',
    };

    dispatch(addAttendanceRecord(newRecord));
    toast.success(`${tanod.fullName} clocked in successfully`);
  };

  const handleClockOut = () => {
    if (selectedTanod === 'all') {
      toast.warning('Please select a tanod member to clock out');
      return;
    }

    const tanod = tanodMembers.find((t) => t.id === selectedTanod);
    const activeRecord = attendanceRecords.find(
      (r) =>
        r.tanodId === selectedTanod &&
        new Date(r.date).toDateString() === new Date().toDateString() &&
        !r.clockOut
    );

    if (!activeRecord) {
      toast.warning('No active clock-in found for today');
      return;
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(activeRecord.clockIn);
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    const updatedRecord = {
      ...activeRecord,
      clockOut: clockOutTime,
      totalHours: Math.round(totalHours * 100) / 100,
      status: 'present',
    };

    dispatch(updateAttendanceRecord(updatedRecord));
    toast.success(`${tanod.fullName} clocked out successfully`);
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = new Date(record.date);
    const matchesTanod = selectedTanod === 'all' || record.tanodId === selectedTanod;
    const matchesDate = recordDate >= dateRange.start && recordDate <= dateRange.end;
    return matchesTanod && matchesDate;
  });

  // Calculate stats
  const totalPresent = filteredRecords.filter((r) => r.status === 'present').length;
  const totalLate = filteredRecords.filter((r) => r.status === 'late').length;
  const totalOnDuty = filteredRecords.filter((r) => r.status === 'on-duty').length;
  const totalHours = filteredRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const avgHours = filteredRecords.length > 0 ? totalHours / filteredRecords.length : 0;

  const columns = [
    {
      field: 'tanodName',
      headerName: 'Tanod Member',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => formatDateTime(value).split(' ')[0],
    },
    {
      field: 'clockIn',
      headerName: 'Clock In',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => formatDateTime(value).split(' ')[1],
    },
    {
      field: 'clockOut',
      headerName: 'Clock Out',
      flex: 1,
      minWidth: 120,
      valueFormatter: (value) => (value ? formatDateTime(value).split(' ')[1] : '-'),
    },
    {
      field: 'totalHours',
      headerName: 'Total Hours',
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (value) => formatDutyHours(value),
    },
    {
      field: 'shift',
      headerName: 'Shift',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
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
          label={params.value.replace('-', ' ')}
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              Attendance Logger
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track duty hours and attendance records
            </Typography>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
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
                  <Typography variant="body2" color="text.secondary">
                    Present
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {totalPresent}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Late
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {totalLate}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
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
                  <Typography variant="body2" color="text.secondary">
                    On Duty
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {totalOnDuty}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
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
                  <Typography variant="body2" color="text.secondary">
                    Avg Hours/Day
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {avgHours.toFixed(1)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
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
                        {tanod.fullName}
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
                <Typography variant="h6" fontWeight={600}>
                  Attendance Records
                </Typography>
                <Stack direction="row" spacing={2}>
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
                  rows={filteredRecords}
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

export default AttendanceLogger;
