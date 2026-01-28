import { format, formatDistance, intervalToDuration } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'HH:mm');
};

export const formatShiftTime = (shift) => {
  return shift === 'day' ? '06:00 - 18:00' : '18:00 - 06:00';
};

export const formatDutyHours = (hours) => {
  if (!hours && hours !== 0) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatResponseTime = (minutes) => {
  if (!minutes && minutes !== 0) return '-';
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatPhoneNumber = (phone) => {
  return phone || '-';
};

export const getStatusLabel = (status) => {
  if (!status) return '-';
  return status
    .replace('-', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getShiftLabel = (shift) => {
  if (!shift) return '-';
  return shift.charAt(0).toUpperCase() + shift.slice(1) + ' Shift';
};

export const getStatusColor = (status, theme) => {
  const statusColors = {
    active: theme.palette.success.main,
    inactive: theme.palette.grey[500],
    'on-leave': theme.palette.warning.main,
    present: theme.palette.success.main,
    absent: theme.palette.error.main,
    late: theme.palette.warning.main,
    'on-duty': theme.palette.info.main,
    scheduled: theme.palette.primary.main,
    completed: theme.palette.success.main,
    missed: theme.palette.error.main,
    'in-progress': theme.palette.info.main,
  };
  return statusColors[status] || theme.palette.grey[500];
};

export const getSeverityColor = (severity, theme) => {
  const severityColors = {
    low: theme.palette.success.main,
    medium: theme.palette.warning.main,
    high: theme.palette.error.main,
    critical: theme.palette.error.dark,
  };
  return severityColors[severity] || theme.palette.grey[500];
};

export const getShiftColor = (shift, theme) => {
  return shift === 'day' ? theme.palette.primary.main : theme.palette.secondary.main;
};
