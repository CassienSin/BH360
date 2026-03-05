import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Chip,
  Button,
  Alert,
  alpha,
  Skeleton,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import { Calendar, Clock, LogIn, LogOut, Sun, Moon, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { isSameDay, startOfMonth, endOfMonth, format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  useTanodSchedules,
  useTanodAttendance,
  useRecordAttendance,
  useCheckoutAttendance,
} from '../../hooks/useTanod';
import { formatDate, formatDateTime, formatDutyHours, getStatusColor, getShiftColor } from '../../utils/tanodFormatters';

// ─── Schedule Calendar Tab ────────────────────────────────────────────────────

const MyScheduleTab = ({ currentUser }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: schedules = [], isLoading, error } = useTanodSchedules(currentUser?.uid);

  const schedulesForDate = schedules.filter((s) => {
    const schedDate = s.date?.toDate ? s.date.toDate() : new Date(s.date);
    return isSameDay(schedDate, selectedDate);
  });

  const upcomingSchedules = schedules
    .filter((s) => {
      const schedDate = s.date?.toDate ? s.date.toDate() : new Date(s.date);
      return schedDate >= new Date();
    })
    .slice(0, 5);

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={380} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load your schedules. Please try again.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        {/* Summary Cards */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {[
            {
              label: 'Total Shifts',
              value: schedules.length,
              color: theme.palette.primary.main,
              icon: Calendar,
            },
            {
              label: 'Upcoming',
              value: upcomingSchedules.length,
              color: theme.palette.info.main,
              icon: Clock,
            },
            {
              label: 'Completed',
              value: schedules.filter((s) => s.status === 'completed').length,
              color: theme.palette.success.main,
              icon: CheckCircle,
            },
          ].map(({ label, value, color, icon: Icon }) => (
            <Box key={label} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33% - 8px)' } }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.04)} 100%)`,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ color }}>
                        {value}
                      </Typography>
                    </Stack>
                    <Avatar sx={{ bgcolor: alpha(color, 0.15), width: 48, height: 48 }}>
                      <Icon size={24} color={color} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>

        {/* Calendar + Day Detail */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Calendar */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
            <CardContent sx={{ p: 1 }}>
              <DateCalendar
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                readOnly
                slotProps={{
                  day: {
                    sx: (dayDate) => {
                      const hasSchedule = schedules.some((s) => {
                        const sd = s.date?.toDate ? s.date.toDate() : new Date(s.date);
                        return isSameDay(sd, dayDate);
                      });
                      return hasSchedule
                        ? {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            borderRadius: '50%',
                            '&:not(.Mui-selected)': {
                              border: `2px solid ${theme.palette.primary.main}`,
                            },
                          }
                        : {};
                    },
                  },
                }}
              />
            </CardContent>
            {/* Legend */}
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                Legend
              </Typography>
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Sun size={15} color={theme.palette.primary.main} />
                  <Typography variant="caption">Day Shift (06:00 – 18:00)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Moon size={15} color={theme.palette.secondary.main} />
                  <Typography variant="caption">Night Shift (18:00 – 06:00)</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Schedules for selected date */}
          <Box sx={{ flexGrow: 1 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Calendar size={20} color={theme.palette.primary.main} />
                    <Typography variant="h6" fontWeight={600}>
                      {formatDate(selectedDate)}
                    </Typography>
                  </Stack>

                  {schedulesForDate.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
                      <Calendar size={48} color={theme.palette.text.disabled} />
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        No schedule assigned for this day
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {schedulesForDate.map((schedule) => {
                        const shiftColor = getShiftColor(schedule.shift, theme);
                        return (
                          <Card
                            key={schedule.id}
                            elevation={0}
                            sx={{
                              bgcolor: alpha(shiftColor, 0.08),
                              border: `1px solid ${alpha(shiftColor, 0.25)}`,
                              borderRadius: 2,
                            }}
                          >
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {schedule.shift === 'day' ? (
                                      <Sun size={18} color={shiftColor} />
                                    ) : (
                                      <Moon size={18} color={shiftColor} />
                                    )}
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: shiftColor }}>
                                      {schedule.shift === 'day' ? 'Day Shift' : 'Night Shift'}
                                    </Typography>
                                  </Stack>
                                  <Chip
                                    label={schedule.status?.replace('-', ' ') || 'scheduled'}
                                    size="small"
                                    color={
                                      schedule.status === 'completed'
                                        ? 'success'
                                        : schedule.status === 'in-progress'
                                        ? 'info'
                                        : 'default'
                                    }
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </Stack>
                                <Stack spacing={0.5}>
                                  <Typography variant="body2">
                                    <strong>Time:</strong>{' '}
                                    <span style={{ color: theme.palette.text.secondary }}>
                                      {schedule.startTime} – {schedule.endTime}
                                    </span>
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <MapPin size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="body2" color="text.secondary">
                                      {schedule.patrolArea || 'No area assigned'}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>

        {/* Upcoming Schedules */}
        {upcomingSchedules.length > 0 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Upcoming Shifts
              </Typography>
              <Stack spacing={1.5}>
                {upcomingSchedules.map((schedule) => {
                  const schedDate = schedule.date?.toDate ? schedule.date.toDate() : new Date(schedule.date);
                  const shiftColor = getShiftColor(schedule.shift, theme);
                  return (
                    <Stack
                      key={schedule.id}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(shiftColor, 0.06),
                        border: `1px solid ${alpha(shiftColor, 0.15)}`,
                      }}
                    >
                      <Avatar sx={{ bgcolor: alpha(shiftColor, 0.15), width: 40, height: 40 }}>
                        {schedule.shift === 'day' ? (
                          <Sun size={20} color={shiftColor} />
                        ) : (
                          <Moon size={20} color={shiftColor} />
                        )}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {format(schedDate, 'EEEE, MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {schedule.startTime} – {schedule.endTime} · {schedule.patrolArea || 'No area'}
                        </Typography>
                      </Box>
                      <Chip
                        label={schedule.shift === 'day' ? 'Day' : 'Night'}
                        size="small"
                        sx={{
                          bgcolor: alpha(shiftColor, 0.12),
                          color: shiftColor,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </LocalizationProvider>
  );
};

// ─── Attendance Tab ────────────────────────────────────────────────────────────

const MyAttendanceTab = ({ currentUser }) => {
  const theme = useTheme();

  const { data: attendanceRecords = [], isLoading, error } = useTanodAttendance(currentUser?.uid);
  const recordAttendanceMutation = useRecordAttendance();
  const checkoutAttendanceMutation = useCheckoutAttendance();

  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  // Determine today's status
  const today = new Date().toDateString();
  const todayRecord = attendanceRecords.find((r) => {
    const recordDate = r.date?.toDate ? r.date.toDate() : new Date(r.date);
    return recordDate.toDateString() === today;
  });
  const isClockedIn = !!todayRecord && !todayRecord.checkOutTime;
  const isClockedOut = !!todayRecord && !!todayRecord.checkOutTime;

  const handleClockIn = async () => {
    if (isClockedIn) {
      toast.warning('You are already clocked in for today');
      return;
    }
    try {
      await recordAttendanceMutation.mutateAsync({
        tanodId: currentUser?.uid,
        tanodName:
          currentUser?.displayName ||
          `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
          currentUser?.email,
        date: new Date(),
        shift: new Date().getHours() < 18 ? 'day' : 'night',
        status: 'on-duty',
        notes: '',
      });
    } catch (err) {
      console.error('[MySchedulePage] clock-in error:', err);
    }
  };

  const handleClockOut = async () => {
    if (!todayRecord) {
      toast.warning('You have not clocked in yet today');
      return;
    }
    if (isClockedOut) {
      toast.warning('You have already clocked out for today');
      return;
    }
    try {
      await checkoutAttendanceMutation.mutateAsync({
        attendanceId: todayRecord.id,
        checkOutTime: new Date(),
      });
    } catch (err) {
      console.error('[MySchedulePage] clock-out error:', err);
    }
  };

  // Filtered records for date range
  const filteredRecords = attendanceRecords.filter((r) => {
    const recordDate = r.date?.toDate ? r.date.toDate() : new Date(r.date);
    return recordDate >= dateRange.start && recordDate <= dateRange.end;
  });

  // Stats
  const totalHours = filteredRecords.reduce((sum, r) => sum + (r.duration ? r.duration / 60 : 0), 0);
  const avgHours = filteredRecords.length > 0 ? totalHours / filteredRecords.length : 0;

  const safeDate = (value) => {
    if (!value) return null;
    return value?.toDate ? value.toDate() : new Date(value);
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 130,
      valueFormatter: (value) => {
        const d = safeDate(value);
        return d ? format(d, 'MMM dd, yyyy') : '-';
      },
    },
    {
      field: 'checkInTime',
      headerName: 'Clock In',
      flex: 1,
      minWidth: 110,
      valueFormatter: (value) => {
        const d = safeDate(value);
        return d ? format(d, 'HH:mm') : '-';
      },
    },
    {
      field: 'checkOutTime',
      headerName: 'Clock Out',
      flex: 1,
      minWidth: 110,
      valueFormatter: (value) => {
        const d = safeDate(value);
        return d ? format(d, 'HH:mm') : 'Active';
      },
    },
    {
      field: 'duration',
      headerName: 'Hours',
      flex: 0.8,
      minWidth: 90,
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
      flex: 0.9,
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

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load your attendance records. Please try again.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        {/* Today's Status Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: isClockedIn
              ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Stack spacing={1} flexGrow={1}>
                <Typography variant="h6" fontWeight={700}>
                  Today's Attendance
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {isClockedIn ? (
                    <>
                      <CheckCircle size={18} color={theme.palette.success.main} />
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        Clocked in at{' '}
                        {todayRecord?.checkInTime
                          ? format(safeDate(todayRecord.checkInTime), 'HH:mm')
                          : '--:--'}
                      </Typography>
                    </>
                  ) : isClockedOut ? (
                    <>
                      <CheckCircle size={18} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        Shift completed · {formatDutyHours(todayRecord?.duration ? todayRecord.duration / 60 : null)}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} color={theme.palette.warning.main} />
                      <Typography variant="body2" color="text.secondary">
                        Not clocked in yet
                      </Typography>
                    </>
                  )}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LogIn size={20} />}
                  onClick={handleClockIn}
                  color="success"
                  disabled={isClockedIn || isClockedOut || recordAttendanceMutation.isPending}
                  sx={{ minWidth: 130 }}
                >
                  {recordAttendanceMutation.isPending ? 'Clocking In…' : 'Clock In'}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LogOut size={20} />}
                  onClick={handleClockOut}
                  color="error"
                  disabled={!isClockedIn || checkoutAttendanceMutation.isPending}
                  sx={{ minWidth: 130 }}
                >
                  {checkoutAttendanceMutation.isPending ? 'Clocking Out…' : 'Clock Out'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Stats */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {[
            { label: 'Total Days', value: filteredRecords.length, color: 'primary' },
            { label: 'On Duty', value: filteredRecords.filter((r) => r.status === 'on-duty').length, color: 'info' },
            { label: 'Total Hours', value: totalHours.toFixed(1) + 'h', color: 'success' },
            { label: 'Avg Hours/Day', value: avgHours.toFixed(1) + 'h', color: 'warning' },
          ].map(({ label, value, color }) => (
            <Box
              key={label}
              sx={{ flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette[color].main, 0.05),
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h5" fontWeight={700} color={`${color}.main`}>
                      {value}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>

        {/* Attendance History */}
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
                <Typography variant="h6" fontWeight={600}>Attendance History</Typography>
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

              {filteredRecords.length === 0 ? (
                <Stack alignItems="center" py={4} spacing={1}>
                  <Clock size={40} color={theme.palette.text.disabled} />
                  <Typography variant="body2" color="text.secondary">
                    No attendance records found for this period
                  </Typography>
                </Stack>
              ) : (
                <Box sx={{ height: 380, width: '100%' }}>
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
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const MySchedulePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    document.title = 'My Schedule – BH360';
  }, []);

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
          My Schedule & Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View your assigned duty schedules and manage your attendance
        </Typography>
      </Stack>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab label="My Schedule" icon={<Calendar size={18} />} iconPosition="start" />
          <Tab label="My Attendance" icon={<Clock size={18} />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <MyScheduleTab currentUser={currentUser} />}
          {activeTab === 1 && <MyAttendanceTab currentUser={currentUser} />}
        </Box>
      </Card>
    </Stack>
  );
};

export default MySchedulePage;
