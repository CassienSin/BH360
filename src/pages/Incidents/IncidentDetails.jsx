import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Divider,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowLeft, MapPin, Calendar, User, Edit, Download, Share2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import StatusUpdateDialog from '../../components/incidents/StatusUpdateDialog';
import AIAnalysisPanel from '../../components/incidents/AIAnalysisPanel';
import ActivityTimeline from '../../components/incidents/ActivityTimeline';

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'tanod';

  // Mock data with AI analysis - replace with actual API call
  const incident = {
    id,
    title: 'Loud music disturbance at night',
    description:
      'There has been continuous loud music from a neighbor\'s house for the past 3 hours. Multiple residents have complained about the noise disturbance. The music is coming from a karaoke session that started at 10 PM and is still ongoing.',
    category: 'noise',
    priority: 'urgent',
    status: 'in-progress',
    location: {
      address: 'Purok 3, Barangay Hall Area',
      coordinates: [14.5995, 120.9842],
    },
    reporterName: 'Juan Dela Cruz',
    reporterContact: '0912-345-6789',
    reporterEmail: 'juan.delacruz@email.com',
    assignedTo: 'Tanod Pedro Santos',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    estimatedResolution: new Date(Date.now() + 7200000).toISOString(),
    attachments: [
      { name: 'noise_evidence.jpg', type: 'image', url: '#' },
      { name: 'location_photo.jpg', type: 'image', url: '#' },
    ],
    // AI Analysis data
    aiClassification: {
      category: 'noise',
      confidence: 92,
      suggestedCategories: ['noise', 'dispute', 'other'],
    },
    aiPriority: {
      score: 68,
      priority: 'urgent',
      factors: {
        category: 15,
        urgency: 25,
        timeOfDay: 10,
        location: 8,
        other: 10,
      },
    },
    aiSuggestions: [
      { priority: 1, action: 'Send Tanod to investigate', icon: 'shield', urgent: true },
      { priority: 2, action: 'Issue verbal warning to responsible party', icon: 'message-square', urgent: false },
      { priority: 3, action: 'Explain barangay noise ordinance', icon: 'book', urgent: false },
      { priority: 4, action: 'Document violation for records', icon: 'clipboard', urgent: false },
      { priority: 5, action: 'Issue citation if repeated violation', icon: 'alert-triangle', urgent: false },
      { priority: 10, action: 'Update incident status regularly', icon: 'refresh-cw', urgent: false },
    ],
  };

  // Activity timeline
  const activities = [
    {
      type: 'status_change',
      title: 'Status Updated',
      description: 'Incident status changed',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      user: 'Admin User',
      statusChange: { from: 'submitted', to: 'in-progress' },
      notes: 'Tanod has been dispatched to investigate the situation.',
    },
    {
      type: 'assigned',
      title: 'Assigned to Tanod',
      description: 'Incident assigned to Tanod Pedro Santos',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      user: 'Admin User',
    },
    {
      type: 'created',
      title: 'Incident Reported',
      description: 'New incident report submitted by resident',
      timestamp: incident.createdAt,
      user: incident.reporterName,
      notes: 'Initial report with AI analysis completed. Priority score: 68/100',
    },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      crime: theme.palette.error.main,
      noise: theme.palette.warning.main,
      hazard: theme.palette.info.main,
      dispute: theme.palette.secondary.main,
      health: theme.palette.error.main,
      utility: theme.palette.info.main,
    };
    return colors[category] || theme.palette.grey[500];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: theme.palette.error.main,
      urgent: theme.palette.warning.main,
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
    };
    return configs[status] || configs.submitted;
  };

  const handleStatusUpdate = (updateData) => {
    // Here you would dispatch to Redux or call an API
  };

  const statusConfig = getStatusConfig(incident.status);

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
            Case #{id}
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
                  Last updated {format(new Date(incident.updatedAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Stack>
            </Stack>
            {incident.estimatedResolution && incident.status !== 'resolved' && (
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
                    Estimated Resolution
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {format(new Date(incident.estimatedResolution), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
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
                        label={incident.category}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getCategoryColor(incident.category), 0.1),
                          color: getCategoryColor(incident.category),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                      <Chip
                        label={incident.priority}
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
                      {incident.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {incident.description}
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
                        {incident.location.address}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 200,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.grey[200], 0.5),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Map View (Leaflet integration)
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Attachments */}
                  {incident.attachments && incident.attachments.length > 0 && (
                    <>
                      <Divider />
                      <Stack spacing={2}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Attachments ({incident.attachments.length})
                        </Typography>
                        <Grid container spacing={1}>
                          {incident.attachments.map((attachment, index) => (
                            <Grid size={{ xs: 6, sm: 4 }} key={index}>
                              <Box
                                sx={{
                                  height: 100,
                                  borderRadius: 2,
                                  backgroundColor: alpha(theme.palette.grey[200], 0.5),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `1px solid ${theme.palette.divider}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" textAlign="center">
                                  {attachment.name}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <AIAnalysisPanel incident={incident} />

            {/* Activity Timeline */}
            <ActivityTimeline activities={activities} />
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
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
                        label={incident.priority}
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
                        {incident.reporterName}
                      </Typography>
                    </Stack>
                    {isAdmin && (
                      <>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Contact Info
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {incident.reporterContact}
                          </Typography>
                          {incident.reporterEmail && (
                            <Typography variant="body2" fontWeight={500}>
                              {incident.reporterEmail}
                            </Typography>
                          )}
                        </Stack>
                      </>
                    )}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Assigned to
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={incident.assignedTo ? 'text.primary' : 'text.disabled'}>
                        {incident.assignedTo || 'Unassigned'}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {format(new Date(incident.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {format(new Date(incident.updatedAt), 'MMM dd, yyyy')}
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
                      <Button variant="outlined" fullWidth startIcon={<Edit size={18} />}>
                        Edit Incident
                      </Button>
                      <Button variant="outlined" fullWidth startIcon={<User size={18} />}>
                        Reassign Tanod
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
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      {isAdmin && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          incident={incident}
          onUpdate={handleStatusUpdate}
        />
      )}
    </Stack>
  );
};

export default IncidentDetails;
