import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import { Clock, CheckCircle2, AlertCircle, User, Edit, FileText } from 'lucide-react';
import { format } from 'date-fns';

const ActivityTimeline = ({ activities = [] }) => {
  const theme = useTheme();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <FileText size={16} />;
      case 'status_change':
        return <Edit size={16} />;
      case 'assigned':
        return <User size={16} />;
      case 'resolved':
        return <CheckCircle2 size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'created':
        return theme.palette.info.main;
      case 'status_change':
        return theme.palette.warning.main;
      case 'assigned':
        return theme.palette.secondary.main;
      case 'resolved':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (activities.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Activity Timeline
          </Typography>
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <AlertCircle size={32} style={{ marginBottom: 8 }} />
            <Typography variant="body2">No activity recorded yet</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={3}>
          Activity Timeline
        </Typography>
        <Stack spacing={3}>
          {activities.map((activity, index) => (
            <Stack key={index} direction="row" spacing={2}>
              {/* Timeline indicator */}
              <Stack alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: alpha(getActivityColor(activity.type), 0.1),
                    color: getActivityColor(activity.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Box>
                {index < activities.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      backgroundColor: theme.palette.divider,
                      my: 1,
                    }}
                  />
                )}
              </Stack>

              {/* Activity content */}
              <Stack spacing={0.5} flex={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {activity.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.timestamp ? format(
                      activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp),
                      'MMM dd, yyyy HH:mm'
                    ) : '-'}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {activity.description}
                </Typography>
                {activity.user && (
                  <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                    <User size={14} color={theme.palette.text.secondary} />
                    <Typography variant="caption" color="text.secondary">
                      {activity.user}
                    </Typography>
                  </Stack>
                )}
                {activity.statusChange && (
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <Chip
                      label={activity.statusChange.from.replace('-', ' ')}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                      }}
                    />
                    <Typography variant="caption">→</Typography>
                    <Chip
                      label={activity.statusChange.to.replace('-', ' ')}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                        backgroundColor: alpha(getActivityColor(activity.type), 0.1),
                        color: getActivityColor(activity.type),
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                )}
                {activity.notes && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.grey[500], 0.05),
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {activity.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
