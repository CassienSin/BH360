import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography, Tabs, Tab, Box, Card, CardContent, Grid, Avatar, Chip, IconButton, alpha, Button, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Shield, Users, Calendar, Clock, MapPin, AlertCircle, Plus, Edit, Trash2, Brain } from 'lucide-react';
import { useAllTanods, useAllAttendance, useAllSchedules } from '../../hooks/useTanod';
import { useDeleteUser } from '../../hooks/useUsers';
import { useAllIncidents } from '../../hooks/useIncidents';
import TanodProfileDialog from '../../components/tanod/TanodProfileDialog';
import DutyScheduler from '../../components/tanod/DutyScheduler';
import AttendanceLogger from '../../components/tanod/AttendanceLogger';
import IncidentResponseLog from '../../components/tanod/IncidentResponseLog';
import PatrolAreaAssignment from '../../components/tanod/PatrolAreaAssignment';
import { toast } from 'react-toastify';
import { getStatusColor } from '../../utils/tanodFormatters';

const TanodManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch data from Firebase
  const { data: tanodMembers = [], isLoading: loadingTanods, error: tanodsError } = useAllTanods();
  const { data: dutySchedules = [], isLoading: loadingSchedules } = useAllSchedules();
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useAllAttendance();
  const { data: allIncidents = [] } = useAllIncidents();
  
  const deleteUser = useDeleteUser();

  const [activeTab, setActiveTab] = useState(0);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedTanod, setSelectedTanod] = useState(null);

  const isLoading = loadingTanods || loadingSchedules || loadingAttendance;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddTanod = () => {
    setSelectedTanod(null);
    setProfileDialogOpen(true);
  };

  const handleEditTanod = (tanod) => {
    setSelectedTanod(tanod);
    setProfileDialogOpen(true);
  };

  const handleDeleteTanod = async (tanodId) => {
    if (window.confirm('Are you sure you want to delete this tanod member?')) {
      try {
        await deleteUser.mutateAsync(tanodId);
        // Success toast shown by hook
      } catch (error) {
        console.error('Error deleting tanod:', error);
        // Error toast shown by hook
      }
    }
  };

  // Calculate dashboard stats
  const totalTanod = tanodMembers.length;
  const activeTanod = tanodMembers.filter((t) => t.status === 'active').length;
  const onDutyTanod = dutySchedules.filter(
    (s) => s.status === 'in-progress' && new Date(s.date?.toDate ? s.date.toDate() : s.date).toDateString() === new Date().toDateString()
  ).length;
  const todayAttendance = attendanceRecords.filter((a) => {
    const recordDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    return recordDate.toDateString() === new Date().toDateString();
  }).length;
  const attendanceRate = totalTanod > 0 ? (todayAttendance / totalTanod) * 100 : 0;
  
  // Count incident responses (incidents assigned to tanods)
  const incidentResponses = allIncidents.filter(inc => inc.assignedTo);

  // Error state
  if (tanodsError) {
    return (
      <Stack spacing={3} className="animate-fade-in">
        <Alert severity="error">
          Failed to load tanod data. Please check your Firebase connection.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Tanod Management System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive management of tanod members, schedules, and operations
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Brain size={20} />}
          onClick={() => navigate('/tanod/performance')}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          Performance Insights
        </Button>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Dashboard Stats */}
          {activeTab === 0 && (
            <>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Total Tanod
                          </Typography>
                          <Typography variant="h3" fontWeight={700} color="primary.main">
                            {totalTanod}
                          </Typography>
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            {activeTanod} Active
                          </Typography>
                        </Stack>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), width: 56, height: 56 }}>
                          <Users size={28} color={theme.palette.primary.main} />
                        </Avatar>
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
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            On Duty
                          </Typography>
                          <Typography variant="h3" fontWeight={700} color="info.main">
                            {onDutyTanod}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Currently Active
                          </Typography>
                        </Stack>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), width: 56, height: 56 }}>
                          <Shield size={28} color={theme.palette.info.main} />
                        </Avatar>
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
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Attendance Rate
                          </Typography>
                          <Typography variant="h3" fontWeight={700} color="success.main">
                            {attendanceRate.toFixed(0)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Today
                          </Typography>
                        </Stack>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), width: 56, height: 56 }}>
                          <Clock size={28} color={theme.palette.success.main} />
                        </Avatar>
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
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Total Incidents
                          </Typography>
                          <Typography variant="h3" fontWeight={700} color="warning.main">
                            {incidentResponses.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned
                          </Typography>
                        </Stack>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), width: 56, height: 56 }}>
                          <AlertCircle size={28} color={theme.palette.warning.main} />
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </>
          )}

          {/* Tabs */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                px: 2,
              }}
            >
              <Tab label="Tanod Profiles" icon={<Users size={18} />} iconPosition="start" />
              <Tab label="Duty Scheduling" icon={<Calendar size={18} />} iconPosition="start" />
              <Tab label="Attendance Logs" icon={<Clock size={18} />} iconPosition="start" />
              <Tab label="Patrol Areas" icon={<MapPin size={18} />} iconPosition="start" />
              <Tab label="Incident Responses" icon={<AlertCircle size={18} />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Tab 0: Tanod Profiles */}
              {activeTab === 0 && (
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>
                      Tanod Members
                    </Typography>
                    <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleAddTanod}>
                      Add Tanod
                    </Button>
                  </Stack>

                  {tanodMembers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No tanod members found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click "Add Tanod" to create your first tanod member
                      </Typography>
                    </Box>
                  ) : (
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {tanodMembers.map((tanod) => (
                        <Box key={tanod.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)', lg: '1 1 calc(33.333% - 11px)' } }}>
                          <Card
                            elevation={0}
                            className="hover-lift"
                            sx={{
                              borderRadius: 3,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                    <Shield size={28} />
                                  </Avatar>
                                  <Stack flexGrow={1}>
                                    <Typography variant="h6" fontWeight={600}>
                                      {tanod.displayName || tanod.fullName || `${tanod.firstName} ${tanod.lastName}`}
                                    </Typography>
                                    <Chip
                                      label={tanod.status?.replace('-', ' ') || 'active'}
                                      size="small"
                                      sx={{
                                        width: 'fit-content',
                                        backgroundColor: alpha(getStatusColor(tanod.status || 'active', theme), 0.1),
                                        color: getStatusColor(tanod.status || 'active', theme),
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                      }}
                                    />
                                  </Stack>
                                </Stack>

                                <Stack spacing={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Email:</strong> {tanod.email}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Phone:</strong> {tanod.phone || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Current Shift:</strong>{' '}
                                    {tanod.currentShift ? tanod.currentShift.charAt(0).toUpperCase() + tanod.currentShift.slice(1) : 'Off'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Assigned Areas:</strong> {tanod.assignedAreas?.join(', ') || 'None'}
                                  </Typography>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Rating:</strong> {tanod.rating || '5.0'}/5.0
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {tanod.totalIncidentsResponded || 0} incidents
                                    </Typography>
                                  </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1}>
                                  <Button
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Edit size={16} />}
                                    onClick={() => handleEditTanod(tanod)}
                                  >
                                    Edit
                                  </Button>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteTanod(tanod.id)}
                                    sx={{ border: `1px solid ${theme.palette.divider}` }}
                                    disabled={deleteUser.isPending}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Tab 1: Duty Scheduling */}
              {activeTab === 1 && <DutyScheduler />}

              {/* Tab 2: Attendance Logs */}
              {activeTab === 2 && <AttendanceLogger />}

              {/* Tab 3: Patrol Areas */}
              {activeTab === 3 && <PatrolAreaAssignment />}

              {/* Tab 4: Incident Responses */}
              {activeTab === 4 && <IncidentResponseLog />}
            </Box>
          </Card>
        </>
      )}

      {/* Tanod Profile Dialog */}
      <TanodProfileDialog
        open={profileDialogOpen}
        onClose={() => {
          setProfileDialogOpen(false);
          setSelectedTanod(null);
        }}
        tanod={selectedTanod}
      />
    </Stack>
  );
};

export default TanodManagement;
