import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Calendar, Plus, Sun, Moon, MapPin } from 'lucide-react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { addDutySchedule } from '../../store/slices/tanodSlice';
import { toast } from 'react-toastify';
import { format, isSameDay } from 'date-fns';
import { formatDate, getShiftColor } from '../../utils/tanodFormatters';

const DutyScheduler = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { tanodMembers, dutySchedules, patrolAreas } = useSelector((state) => state.tanod);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    tanodId: '',
    shift: 'day',
    patrolArea: '',
    startTime: '06:00',
    endTime: '18:00',
  });

  const activeTanod = tanodMembers.filter((t) => t.status === 'active');
  const schedulesForDate = dutySchedules.filter((s) => isSameDay(new Date(s.date), selectedDate));

  const handleOpenDialog = () => {
    setScheduleForm({
      tanodId: '',
      shift: 'day',
      patrolArea: '',
      startTime: '06:00',
      endTime: '18:00',
    });
    setOpenDialog(true);
  };

  const handleChange = (field, value) => {
    setScheduleForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-update times based on shift
      if (field === 'shift') {
        if (value === 'day') {
          updated.startTime = '06:00';
          updated.endTime = '18:00';
        } else {
          updated.startTime = '18:00';
          updated.endTime = '06:00';
        }
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!scheduleForm.tanodId || !scheduleForm.patrolArea) {
      toast.error('Please select tanod member and patrol area');
      return;
    }

    const tanod = tanodMembers.find((t) => t.id === scheduleForm.tanodId);
    const newSchedule = {
      id: `sched-${Date.now()}`,
      tanodId: scheduleForm.tanodId,
      tanodName: tanod.fullName,
      date: selectedDate,
      shift: scheduleForm.shift,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      patrolArea: scheduleForm.patrolArea,
      status: 'scheduled',
    };

    dispatch(addDutySchedule(newSchedule));
    toast.success('Duty schedule created successfully');
    setOpenDialog(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              Duty Scheduler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage shift schedules and patrol assignments
            </Typography>
          </Stack>
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleOpenDialog}>
            Schedule Shift
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Calendar */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <DateCalendar value={selectedDate} onChange={(date) => setSelectedDate(date)} />
              </CardContent>
            </Card>

            {/* Legend */}
            <Card
              elevation={0}
              sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, mt: 2 }}
            >
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Shift Legend
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Sun size={16} color={theme.palette.primary.main} />
                    <Typography variant="body2">Day Shift (06:00 - 18:00)</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Moon size={16} color={theme.palette.secondary.main} />
                    <Typography variant="body2">Night Shift (18:00 - 06:00)</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Schedules for Selected Date */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Calendar size={20} color={theme.palette.primary.main} />
                    <Typography variant="h6" fontWeight={600}>
                      {formatDate(selectedDate)}
                    </Typography>
                  </Stack>

                  {schedulesForDate.length === 0 ? (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{ py: 6, px: 2 }}
                      spacing={2}
                    >
                      <Calendar size={48} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        No schedules for this date
                        <br />
                        Click "Schedule Shift" to add one
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {schedulesForDate.map((schedule) => (
                        <Card
                          key={schedule.id}
                          elevation={0}
                          sx={{
                            bgcolor: alpha(getShiftColor(schedule.shift, theme), 0.08),
                            border: `1px solid ${alpha(getShiftColor(schedule.shift, theme), 0.2)}`,
                            borderRadius: 2,
                          }}
                        >
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Stack spacing={0.5}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {schedule.tanodName}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {schedule.shift === 'day' ? (
                                      <Sun size={16} color={theme.palette.primary.main} />
                                    ) : (
                                      <Moon size={16} color={theme.palette.secondary.main} />
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                      {schedule.shift === 'day' ? 'Day Shift' : 'Night Shift'}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                <Chip
                                  label={schedule.status.replace('-', ' ')}
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
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body2" fontWeight={600}>
                                    Time:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.startTime} - {schedule.endTime}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <MapPin size={14} color={theme.palette.text.secondary} />
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.patrolArea}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Schedule Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={700}>
              Schedule Duty Shift
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedDate)}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Tanod Member</InputLabel>
                <Select
                  value={scheduleForm.tanodId}
                  onChange={(e) => handleChange('tanodId', e.target.value)}
                  label="Tanod Member"
                >
                  {activeTanod.map((tanod) => (
                    <MenuItem key={tanod.id} value={tanod.id}>
                      {tanod.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={scheduleForm.shift}
                  onChange={(e) => handleChange('shift', e.target.value)}
                  label="Shift"
                >
                  <MenuItem value="day">Day Shift (06:00 - 18:00)</MenuItem>
                  <MenuItem value="night">Night Shift (18:00 - 06:00)</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth>
                <InputLabel>Patrol Area</InputLabel>
                <Select
                  value={scheduleForm.patrolArea}
                  onChange={(e) => handleChange('patrolArea', e.target.value)}
                  label="Patrol Area"
                >
                  {patrolAreas.map((area) => (
                    <MenuItem key={area.id} value={area.name}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenDialog(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              Schedule Shift
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </LocalizationProvider>
  );
};

export default DutyScheduler;
