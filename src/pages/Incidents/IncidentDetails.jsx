import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Chip,
  Divider,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowLeft, MapPin, Calendar, User, Edit, Download, Share2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppSelector } from '../../store/hooks';
import { useIncident } from '../../hooks/useIncidents';
import { useAllTanods } from '../../hooks/useTanod';
import StatusUpdateDialog from '../../components/incidents/StatusUpdateDialog';
import AssignTanodDialog from '../../components/incidents/AssignTanodDialog';
import AIAnalysisPanel from '../../components/incidents/AIAnalysisPanel';
import ActivityTimeline from '../../components/incidents/ActivityTimeline';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_COORDINATES = [14.5995, 120.9842];

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'tanod';

  // Fetch incident data from Firebase
  const { data: incident, isLoading, error } = useIncident(id);
  
  // Fetch tanods to get assigned tanod details
  const { data: tanods = [] } = useAllTanods();

  // Get assigned tanod details
  const assignedTanod = tanods.find((t) => t.id === incident?.assignedTo);

  // Parse location coordinates
  const getLocationCoordinates = () => {
    if (!incident?.location) return DEFAULT_COORDINATES;
    
    const coordMatch = incident.location.match(/\(([^,]+),\s*([^)]+)\)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return DEFAULT_COORDINATES;
  };

  const getLocationAddress = () => {
    if (!incident?.location) return 'Location not specified';
    return incident.location.split('(')[0].trim() || incident.location;
  };

  const getCategoryColor = (category) => {
    const colors = {
      crime: theme.palette.error.main,
      noise: theme.palette.warning.main,
      fire: theme.palette.error.main,
      hazard: theme.palette.info.main,
      dispute: theme.palette.secondary.main,
      health: theme.palette.error.main,
      utility: theme.palette.info.main,
      other: theme.palette.grey[500],
    };
    return colors[category] || theme.palette.grey[500];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: theme.palette.error.main,
      urgent: theme.palette.warning.main,
      medium: theme.palette.warning.main,
      minor: theme.palette.info.main,
      low: theme.palette.success.main,
    };
    return colors[priority] || theme.palette.grey[500];
  };

  const getStatusConfig = (status) => {
    const configs = {
      submitted: {
        label: 'Submitted',
        icon: <AlertCircle size={16} />,
        color: theme.palette.info.main,
      },
      'in-progress': {
        label: 'In Progress',
        icon: <Clock size={16} />,
        color: theme.palette.warning.main,
      },
      resolved: {
        label: 'Resolved',
        icon: <Clock size={16} />,
        color: theme.palette.success.main,
      },
      rejected: {
        label: 'Rejected',
        icon: <AlertCircle size={16} />,
        color: theme.palette.error.main,
      },
    };
    return configs[status] || configs.submitted;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  // Activity timeline - simplified version
  const activities = incident
    ? [
        incident.resolvedAt && {
          type: 'resolved',
          title: 'Incident Resolved',
          description: 'Incident marked as resolved',
          timestamp: incident.resolvedAt?.toDate ? incident.resolvedAt.toDate() : incident.resolvedAt,
        },
        incident.assignedTo && {
          type: 'assigned',
          title: 'Assigned to Tanod',
          description: `Incident assigned to ${assignedTanod?.displayName || assignedTanod?.firstName || 'Tanod'}`,
          timestamp: incident.updatedAt?.toDate ? incident.updatedAt.toDate() : incident.updatedAt,
        },
        {
          type: 'created',
          title: 'Incident Reported',
          description: `New incident report submitted by ${incident.reporterName || 'resident'}`,
          timestamp: incident.createdAt?.toDate ? incident.createdAt.toDate() : incident.createdAt,
        },
      ].filter(Boolean)
    : [];

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading incident details...</Typography>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error || !incident) {
    return (
      <Stack spacing={3}>
        <Button variant="outlined" startIcon={<ArrowLeft size={20} />} onClick={() => navigate('/incidents')}>
          Back to Incidents
        </Button>
        <Alert severity="error">
          {error ? 'Failed to load incident details. Please try again.' : 'Incident not found.'}
        </Alert>
      </Stack>
    );
  }

  const statusConfig = getStatusConfig(incident.status);
  const coordinates = getLocationCoordinates();
  const locationAddress = getLocationAddress();

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
        <Button variant="outlined" startIcon={<ArrowLeft size={20} />} onClick={() => navigate('/incidents')}>
          Back
        </Button>
        <Stack spacing={0.5} flexGrow={1}>
          <Typography variant="h4" fontWeight={700}>
            Incident Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Case #{id.substring(0, 8)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Share Incident">
            <IconButton
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <Share2 size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Report">
            <IconButton
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <Download size={20} />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Edit size={20} />}
              onClick={() => setStatusDialogOpen(true)}
            >
              Update Status
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Status Banner */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(statusConfig.color, 0.05)} 0%, ${alpha(
            statusConfig.color,
            0.02
          )} 100%)`,
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(statusConfig.color, 0.1),
                  color: statusConfig.color,
                }}
              >
                {statusConfig.icon}
              </Box>
              <Stack>
                <Typography variant="h6" fontWeight={700}>
                  {statusConfig.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated {formatDate(incident.updatedAt)}
                </Typography>
              </Stack>
            </Stack>
            {incident.status !== 'resolved' && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                p={1.5}
                sx={{
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.grey[500], 0.05),
                }}
              >
                <Clock size={16} color={theme.palette.text.secondary} />
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Reported
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(incident.createdAt)}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={3}
        sx={{ alignItems: 'flex-start' }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, width: '100%', maxWidth: { lg: 'calc(66.666% - 12px)' } }}>
          <Stack spacing={3}>
            {/* Incident Details Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Stack spacing={3}>
                  {/* Header */}
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={incident.category || 'other'}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getCategoryColor(incident.category), 0.1),
                          color: getCategoryColor(incident.category),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                      <Chip
                        label={incident.priority || 'medium'}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getPriorityColor(incident.priority), 0.1),
                          color: getPriorityColor(incident.priority),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                    <Typography variant="h5" fontWeight={700}>
                      {incident.title || 'Untitled Incident'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {incident.description || 'No description provided'}
                    </Typography>
                  </Stack>

                  <Divider />

                  {/* Location */}
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Location
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MapPin size={20} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {locationAddress}
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 200, borderRadius: 2, overflow: 'hidden' }}>
                      <MapContainer
                        center={coordinates}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={coordinates}>
                          <Popup>{locationAddress}</Popup>
                        </Marker>
                      </MapContainer>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* AI Analysis - only if data available */}
            {incident.aiClassification && <AIAnalysisPanel incident={incident} />}

            {/* Activity Timeline */}
            <ActivityTimeline activities={activities} />
          </Stack>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: '100%', maxWidth: { lg: 'calc(33.333% - 12px)' } }}>
          <Stack spacing={3}>
            {/* Incident Information */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Stack spacing={2.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Incident Information
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Priority
                      </Typography>
                      <Chip
                        label={incident.priority || 'medium'}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getPriorityColor(incident.priority), 0.1),
                          color: getPriorityColor(incident.priority),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Reported by
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {incident.reporterName || 'Anonymous'}
                      </Typography>
                    </Stack>
                    {isAdmin && incident.reporterContact && (
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Contact Info
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {incident.reporterContact}
                        </Typography>
                      </Stack>
                    )}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Assigned to
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={assignedTanod ? 'text.primary' : 'text.disabled'}>
                        {assignedTanod?.displayName || assignedTanod?.firstName || 'Unassigned'}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(incident.createdAt)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(incident.updatedAt)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions (Admin only) */}
            {isAdmin && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Quick Actions
                    </Typography>
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<User size={18} />}
                        onClick={() => setAssignDialogOpen(true)}
                      >
                        {incident.assignedTo ? 'Reassign Tanod' : 'Assign Tanod'}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Download size={18} />}
                        sx={{
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Generate Report
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Status Update Dialog */}
      {isAdmin && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          incident={incident}
        />
      )}

      {/* Assign Tanod Dialog */}
      {isAdmin && (
        <AssignTanodDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          incident={incident}
        />
      )}
    </Stack>
  );
};

export default IncidentDetails;
