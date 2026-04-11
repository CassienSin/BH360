import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Stack, Card, CardContent, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { MapPin, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useIncidentsByStatus } from '../../hooks/useIncidents';

const FalseReportTasks = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const { data: falseReports = [], isLoading, error } = useIncidentsByStatus('false-report');

  useEffect(() => {
    document.title = 'False Reports – BH360';
  }, []);

  const tasks = useMemo(() => {
    return falseReports
      .filter((incident) => incident.assignedTo === currentUser?.uid)
      .map((incident) => ({
        id: incident.id,
        title: incident.title || 'Untitled Incident',
        description: incident.description || 'No description provided',
        priority: incident.priority || 'medium',
        status: incident.status || 'false-report',
        category: incident.category || 'other',
        location: {
          address: incident.location || 'Location not specified',
        },
        assignedDate: incident.createdAt?.toDate ? incident.createdAt.toDate() : new Date(),
        reporterName: incident.reporterName,
        reporterContact: incident.reporterContact,
      }));
  }, [falseReports, currentUser?.uid]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency':
      case 'urgent':
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'minor':
      case 'low':
        return 'success.main';
      default:
        return 'text.secondary';
    }
  };

  const getPriorityLabel = (priority) => {
    const map = {
      emergency: 'Emergency',
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      minor: 'Minor',
      low: 'Low',
    };
    return map[priority] || priority;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading false report tasks...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
          False Reports
        </Typography>
        <Alert severity="error">Unable to load false report tasks. Please try again later.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
          False Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          These are incidents you marked as false reports. They are now tracked separately from your active tasks.
        </Typography>
      </Stack>

      {tasks.length === 0 ? (
        <Card className="glass">
          <CardContent>
            <Stack spacing={2} alignItems="center" py={4}>
              <AlertCircle size={48} color="#f59e0b" />
              <Typography variant="h6" fontWeight={600}>
                No false report tasks yet
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Mark a task in My Tasks as a false report and it will appear here.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              className="glass hover-lift"
              sx={{
                height: '100%',
                animation: `fadeIn 0.4s ease-out ${index * 0.08}s both`,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Stack spacing={1} flexGrow={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AlertTriangle size={18} color="#f59e0b" />
                        <Typography variant="h6" fontWeight={600}>
                          {task.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </Stack>
                    <Chip
                      label="False Report"
                      color="warning"
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(task.priority),
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                      {getPriorityLabel(task.priority)} Priority
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MapPin size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {task.location.address}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Clock size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        Marked: {format(task.assignedDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </Stack>

                  {task.reporterName && (
                    <Typography variant="body2" color="text.secondary">
                      Reporter: {task.reporterName}{task.reporterContact ? ` (${task.reporterContact})` : ''}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default FalseReportTasks;
