import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  AlertTriangle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useIncidentsByTanod, useIncidentsByStatus, useUpdateIncident, useAssignIncident } from '../../hooks/useIncidents';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default coordinates for Manila if no coordinates provided
const DEFAULT_COORDINATES = [14.5995, 120.9842];

const TaskManagement = () => {
  const theme = useTheme();
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Get current user from Redux
  const currentUser = useSelector((state) => state.auth.user);
  
  // Fetch incidents assigned to current tanod (use uid not id)
  const { data: assignedIncidents = [], isLoading: loadingAssigned, error: errorAssigned } = useIncidentsByTanod(currentUser?.uid);
  
  // Fetch unassigned/submitted incidents that Tanod can accept
  const { data: availableIncidents = [], isLoading: loadingAvailable, error: errorAvailable } = useIncidentsByStatus('submitted');
  
  // Combine both datasets - filter out incidents already assigned to someone else
  const allIncidents = useMemo(() => {
    // Get unassigned incidents (no assignedTo or assignedTo is null)
    const unassignedIncidents = availableIncidents.filter(inc => !inc.assignedTo);
    
    // Combine assigned incidents with unassigned ones
    return [...assignedIncidents, ...unassignedIncidents];
  }, [assignedIncidents, availableIncidents]);
  
  const isLoading = loadingAssigned || loadingAvailable;
  const error = errorAssigned || errorAvailable;
  
  // Mutations
  const updateIncidentMutation = useUpdateIncident();
  const assignIncidentMutation = useAssignIncident();

  // Convert incidents to tasks format
  const tasks = useMemo(() => {
    return allIncidents.map((incident) => {
      // Parse location - handle different formats
      let coordinates = DEFAULT_COORDINATES;
      let address = incident.location || 'Location not specified';
      
      // If location contains coordinates in format "address (lat, lng)"
      const coordMatch = incident.location?.match(/\(([^,]+),\s*([^)]+)\)/);
      if (coordMatch && incident.location) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = [lat, lng];
        }
        // Extract address without coordinates
        address = incident.location.split('(')[0].trim();
      }

      // Determine task status based on assignment and incident status
      let taskStatus = 'pending';
      if (incident.assignedTo === currentUser?.uid) {
        // Assigned to current user
        if (incident.status === 'resolved') {
          taskStatus = 'completed';
        } else if (incident.status === 'in-progress') {
          taskStatus = 'accepted';
        } else {
          taskStatus = 'pending';
        }
      } else if (!incident.assignedTo && incident.status === 'submitted') {
        // Unassigned - available to accept
        taskStatus = 'available';
      }

      return {
        id: incident.id,
        title: incident.title || 'Untitled Incident',
        description: incident.description || 'No description provided',
        priority: incident.priority || 'medium',
        status: taskStatus,
        category: incident.category || 'other',
        isAssignedToMe: incident.assignedTo === currentUser?.uid,
        location: {
          address: address,
          coordinates: coordinates,
        },
        assignedDate: incident.createdAt?.toDate ? incident.createdAt.toDate() : new Date(),
        dueDate: incident.updatedAt?.toDate 
          ? new Date(incident.updatedAt.toDate().getTime() + 86400000 * 2)
          : new Date(Date.now() + 86400000 * 2),
        reporterName: incident.reporterName,
        reporterContact: incident.reporterContact,
      };
    });
  }, [allIncidents, currentUser?.uid]);

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleAcceptTask = async (task) => {
    try {
      // If task is available (unassigned), assign it to current tanod
      if (task.status === 'available') {
        await assignIncidentMutation.mutateAsync({
          incidentId: task.id,
          tanodId: currentUser?.uid,
        });
      } else {
        // If already assigned, just update status to in-progress
        await updateIncidentMutation.mutateAsync({
          incidentId: task.id,
          updates: { status: 'in-progress' },
        });
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  const handleDeclineTask = (taskId) => {
    toast.info('Task declined. Please contact admin to reassign.');
    setOpenDialog(false);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateIncidentMutation.mutateAsync({
        incidentId: taskId,
        updates: { 
          status: 'resolved',
          resolvedAt: new Date(),
        },
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency':
      case 'urgent':
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'minor':
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityLabel = (priority) => {
    const map = {
      'emergency': 'Emergency',
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'minor': 'Minor',
      'low': 'Low',
    };
    return map[priority] || priority;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'accepted':
        return 'info';
      case 'available':
        return 'warning';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getCategoryIcon = (category) => {
    const iconProps = { size: 18, color: theme.palette.text.secondary };
    switch (category) {
      case 'crime':
      case 'dispute':
        return <AlertTriangle {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading your tasks...</Typography>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    // More detailed error messaging
    const errorMessage = errorAssigned?.message || errorAvailable?.message || 'Unknown error';
    const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                             errorMessage.toLowerCase().includes('denied') ||
                             errorMessage.toLowerCase().includes('insufficient');
    const isIndexError = errorMessage.toLowerCase().includes('index') ||
                        errorMessage.toLowerCase().includes('requires an index');
    
    console.error('Task loading error:', { errorAssigned, errorAvailable, errorMessage });
    
    return (
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          Task Management
        </Typography>
        <Alert severity="error">
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Failed to load tasks
          </Typography>
          {isPermissionError && (
            <>
              <Typography variant="body2" paragraph>
                Permission denied. Your Firestore security rules may be blocking access.
              </Typography>
              <Typography variant="body2">
                <strong>Quick fix:</strong> Update your Firestore security rules in Firebase Console.
                See FIREBASE_TROUBLESHOOTING_TASKS.md for detailed instructions.
              </Typography>
            </>
          )}
          {isIndexError && (
            <>
              <Typography variant="body2" paragraph>
                A required database index is missing.
              </Typography>
              <Typography variant="body2">
                <strong>Quick fix:</strong> Check your browser console for a link to create the index automatically.
              </Typography>
            </>
          )}
          {!isPermissionError && !isIndexError && (
            <>
              <Typography variant="body2" paragraph>
                {errorMessage}
              </Typography>
              <Typography variant="body2">
                Please check:
                • Firestore security rules allow read access
                • You are logged in with a Tanod account
                • Firebase connection is working
              </Typography>
            </>
          )}
        </Alert>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Common solutions:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1. Update Firestore security rules (see FIREBASE_TROUBLESHOOTING_TASKS.md)<br />
            2. Create required database indexes<br />
            3. Ensure you're logged in as a Tanod user<br />
            4. Check browser console for detailed error messages
          </Typography>
        </Alert>
      </Stack>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Task Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your assigned tasks
          </Typography>
        </Stack>
        <Card className="glass">
          <CardContent>
            <Stack spacing={2} alignItems="center" py={4}>
              <CheckCircle size={48} color={theme.palette.success.main} />
              <Typography variant="h6" fontWeight={600}>
                No Tasks Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                You don't have any tasks assigned at the moment. <br />
                Check back later for new assignments.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Task Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your assigned tasks ({tasks.length} active)
        </Typography>
      </Stack>

      {/* Task Stats */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Card className="glass" sx={{ flex: 1, minWidth: 140 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {tasks.filter(t => t.status === 'available').length}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        <Card className="glass" sx={{ flex: 1, minWidth: 140 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {tasks.filter(t => t.status === 'accepted').length}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        <Card className="glass" sx={{ flex: 1, minWidth: 140 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {tasks.filter(t => t.status === 'completed').length}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {tasks.map((task, index) => (
          <Box key={task.id}>
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
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getCategoryIcon(task.category)}
                        <Typography variant="h6" fontWeight={600}>
                          {task.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </Stack>
                    <Chip
                      label={getStatusLabel(task.status)}
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
                      {getPriorityLabel(task.priority)} Priority
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MapPin size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {task.location.address}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Clock size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        Assigned: {format(task.assignedDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1}>
                    {task.status === 'available' ? (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => handleAcceptTask(task)}
                        startIcon={<CheckCircle size={16} />}
                        disabled={assignIncidentMutation.isPending}
                      >
                        Accept Task
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => handleViewTask(task)}
                        startIcon={<MapPin size={16} />}
                      >
                        View Details
                      </Button>
                    )}
                    {task.status === 'accepted' && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => handleCompleteTask(task.id)}
                        startIcon={<CheckCircle size={16} />}
                        color="success"
                        disabled={updateIncidentMutation.isPending}
                      >
                        Complete
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

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
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    label={getStatusLabel(selectedTask.status)}
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
                      {getPriorityLabel(selectedTask.priority)} Priority
                    </Typography>
                  </Box>
                  {selectedTask.category && (
                    <Chip
                      label={selectedTask.category}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  )}
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
                  <Stack direction="row" spacing={1} alignItems="start">
                    <MapPin size={18} color={theme.palette.text.secondary} />
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedTask.location.address}
                    </Typography>
                  </Stack>
                  {selectedTask.reporterName && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">
                        <strong>Reporter:</strong> {selectedTask.reporterName}
                        {selectedTask.reporterContact && ` (${selectedTask.reporterContact})`}
                      </Typography>
                    </Stack>
                  )}
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
              {(selectedTask.status === 'pending' || selectedTask.status === 'available') && (
                <>
                  <Button
                    onClick={() => handleDeclineTask(selectedTask.id)}
                    startIcon={<XCircle size={18} />}
                    color="error"
                    disabled={updateIncidentMutation.isPending || assignIncidentMutation.isPending}
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleAcceptTask(selectedTask)}
                    variant="contained"
                    startIcon={<CheckCircle size={18} />}
                    disabled={updateIncidentMutation.isPending || assignIncidentMutation.isPending}
                  >
                    {(updateIncidentMutation.isPending || assignIncidentMutation.isPending) ? 'Accepting...' : 'Accept Task'}
                  </Button>
                </>
              )}
              {selectedTask.status === 'accepted' && (
                <Button
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  variant="contained"
                  startIcon={<CheckCircle size={18} />}
                  color="success"
                  disabled={updateIncidentMutation.isPending}
                >
                  {updateIncidentMutation.isPending ? 'Completing...' : 'Mark as Complete'}
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
