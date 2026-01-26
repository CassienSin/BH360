import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
} from '@mui/material';
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TaskManagement = () => {
  const theme = useTheme();
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Patrol Area 5',
      description: 'Conduct routine patrol in residential area 5. Report any suspicious activities.',
      priority: 'medium',
      status: 'pending',
      location: {
        address: '123 Main Street, Barangay Hall',
        coordinates: [14.5995, 120.9842],
      },
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
    {
      id: '2',
      title: 'Respond to Noise Complaint',
      description: 'Investigate noise complaint at residential complex. Coordinate with residents.',
      priority: 'high',
      status: 'pending',
      location: {
        address: '456 Oak Avenue, Block 3',
        coordinates: [14.5985, 120.9852],
      },
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 86400000),
    },
    {
      id: '3',
      title: 'Security Check at Market',
      description: 'Perform security inspection at the local market area during peak hours.',
      priority: 'low',
      status: 'accepted',
      location: {
        address: '789 Market Street, Public Market',
        coordinates: [14.6005, 120.9832],
      },
      assignedDate: new Date(Date.now() - 86400000),
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
  ]);

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleAcceptTask = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: 'accepted' } : task
      )
    );
    toast.success('Task accepted successfully!');
    setOpenDialog(false);
  };

  const handleDeclineTask = (taskId) => {
    toast.info('Task declined');
    setOpenDialog(false);
  };

  const handleCompleteTask = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );
    toast.success('Task marked as completed!');
    setOpenDialog(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'accepted':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Task Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your assigned tasks
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {tasks.map((task, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={task.id}>
            <Card
              className="glass hover-lift"
              sx={{
                height: '100%',
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Stack spacing={1} flexGrow={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </Stack>
                    <Chip
                      label={task.status.replace('-', ' ')}
                      color={getStatusColor(task.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize', ml: 1 }}
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
                      {task.priority} Priority
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MapPin size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {task.location.address}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Clock size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        Due: {format(task.dueDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => handleViewTask(task)}
                      startIcon={<MapPin size={16} />}
                    >
                      View Details
                    </Button>
                    {task.status === 'accepted' && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => handleCompleteTask(task.id)}
                        startIcon={<CheckCircle size={16} />}
                        color="success"
                      >
                        Complete
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Task Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        }}
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={700}>
                  {selectedTask.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={selectedTask.status.replace('-', ' ')}
                    color={getStatusColor(selectedTask.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: alpha(getPriorityColor(selectedTask.priority), 0.1),
                    }}
                  >
                    <AlertCircle size={14} color={getPriorityColor(selectedTask.priority)} />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={getPriorityColor(selectedTask.priority)}
                      textTransform="capitalize"
                    >
                      {selectedTask.priority} Priority
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="body1" color="text.secondary">
                  {selectedTask.description}
                </Typography>

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Clock size={18} color={theme.palette.text.secondary} />
                    <Typography variant="body2">
                      <strong>Assigned:</strong> {format(selectedTask.assignedDate, 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Clock size={18} color={theme.palette.text.secondary} />
                    <Typography variant="body2">
                      <strong>Due Date:</strong> {format(selectedTask.dueDate, 'MMM dd, yyyy')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="start">
                    <MapPin size={18} color={theme.palette.text.secondary} />
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedTask.location.address}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Map */}
                <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden' }}>
                  <MapContainer
                    center={selectedTask.location.coordinates}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={selectedTask.location.coordinates}>
                      <Popup>{selectedTask.location.address}</Popup>
                    </Marker>
                  </MapContainer>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Navigation size={18} />}
                  onClick={() => {
                    const [lat, lng] = selectedTask.location.coordinates;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                  }}
                >
                  Get Directions
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              {selectedTask.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleDeclineTask(selectedTask.id)}
                    startIcon={<XCircle size={18} />}
                    color="error"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleAcceptTask(selectedTask.id)}
                    variant="contained"
                    startIcon={<CheckCircle size={18} />}
                  >
                    Accept Task
                  </Button>
                </>
              )}
              {selectedTask.status === 'accepted' && (
                <Button
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  variant="contained"
                  startIcon={<CheckCircle size={18} />}
                  color="success"
                >
                  Mark as Complete
                </Button>
              )}
              {selectedTask.status === 'completed' && (
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  Task Completed ✓
                </Typography>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
};

export default TaskManagement;
