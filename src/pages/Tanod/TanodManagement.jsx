import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  alpha,
  Button,
  Skeleton,
  Alert,
} from '@mui/material';
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
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import { getStatusColor } from '../../utils/tanodFormatters';

// ─── Skeleton for stat cards (Issue #20) ─────────────────────────────────────
const StatCardSkeleton = () => (
  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="start">
        <Stack spacing={1}>
          <Skeleton width={100} height={20} />
          <Skeleton width={60} height={48} />
          <Skeleton width={80} height={16} />
        </Stack>
        <Skeleton variant="circular" width={56} height={56} />
      </Stack>
    </CardContent>
  </Card>
);

const TanodManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: tanodMembers = [], isLoading: loadingTanods, error: tanodsError } = useAllTanods();
  const { data: dutySchedules = [], isLoading: loadingSchedules } = useAllSchedules();
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useAllAttendance();
  const { data: allIncidents = [] } = useAllIncidents();

  const deleteUser = useDeleteUser();

  const [activeTab, setActiveTab] = useState(0);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedTanod, setSelectedTanod] = useState(null);

  // Issue #19: Replace window.confirm with MUI ConfirmDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tanodToDelete, setTanodToDelete] = useState(null);

  const isLoading = loadingTanods || loadingSchedules || loadingAttendance;

  // Issue #23: Update document title
  useEffect(() => {
    document.title = 'Tanod Management – BH360';
  }, []);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleAddTanod = () => {
    setSelectedTanod(null);
    setProfileDialogOpen(true);
  };

  const handleEditTanod = (tanod) => {
    setSelectedTanod(tanod);
    setProfileDialogOpen(true);
  };

  const handleDeleteTanod = (tanodId) => {
    setTanodToDelete(tanodId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser.mutateAsync(tanodToDelete);
    } catch (error) {
      console.error('Error deleting tanod:', error);
    } finally {
      setDeleteDialogOpen(false);
      setTanodToDelete(null);
    }
  };

  // Dashboard stats
  const totalTanod = tanodMembers.length;
  const activeTanod = tanodMembers.filter((t) => t.status === 'active').length;
  const onDutyTanod = dutySchedules.filter(
    (s) =>
      s.status === 'in-progress' &&
      new Date(s.date?.toDate ? s.date.toDate() : s.date).toDateString() === new Date().toDateString()
  ).length;
  const todayAttendance = attendanceRecords.filter((a) => {
    const recordDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    return recordDate.toDateString() === new Date().toDateString();
  }).length;
  const attendanceRate = totalTanod > 0 ? (todayAttendance / totalTanod) * 100 : 0;
  const incidentResponses = allIncidents.filter((inc) => inc.assignedTo);

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
          {/* Issue #6: component="h1" */}
          <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
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

      {/* Issue #20: Skeleton loaders instead of full-page spinner */}
      {isLoading ? (
        <>
          {activeTab === 0 && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                  <StatCardSkeleton />
                </Box>
              ))}
            </Stack>
          )}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 3 }}>
              <Skeleton height={48} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={120} />
                ))}
              </Stack>
            </Box>
          </Card>
        </>
      ) : (
        <>
          {activeTab === 0 && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {[
                { label: 'Total Tanod', value: totalTanod, sub: `${activeTanod} Active`, color: theme.palette.primary.main, icon: Users },
                { label: 'On Duty', value: onDutyTanod, sub: 'Currently Active', color: theme.palette.info.main, icon: Shield },
                { label: 'Attendance Rate', value: `${attendanceRate.toFixed(0)}%`, sub: 'Today', color: theme.palette.success.main, icon: Clock },
                { label: 'Total Incidents', value: incidentResponses.length, sub: 'Assigned', color: theme.palette.warning.main, icon: AlertCircle },
              ].map(({ label, value, sub, color, icon: Icon }) => (
                <Box key={label} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                          <Typography variant="h3" fontWeight={700} sx={{ color }}>
                            {value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{sub}</Typography>
                        </Stack>
                        <Avatar sx={{ bgcolor: alpha(color, 0.2), width: 56, height: 56 }}>
                          <Icon size={28} color={color} />
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Stack>
          )}

          {/* Tabs */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}
            >
              <Tab label="Tanod Profiles" icon={<Users size={18} />} iconPosition="start" />
              <Tab label="Duty Scheduling" icon={<Calendar size={18} />} iconPosition="start" />
              <Tab label="Attendance Logs" icon={<Clock size={18} />} iconPosition="start" />
              <Tab label="Patrol Areas" icon={<MapPin size={18} />} iconPosition="start" />
              <Tab label="Incident Responses" icon={<AlertCircle size={18} />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>Tanod Members</Typography>
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
                        <Box
                          key={tanod.id}
                          sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)', lg: '1 1 calc(33.333% - 11px)' } }}
                        >
                          <Card
                            elevation={0}
                            className="hover-lift"
                            sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
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
                                    {tanod.currentShift
                                      ? tanod.currentShift.charAt(0).toUpperCase() + tanod.currentShift.slice(1)
                                      : 'Off'}
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
                                    aria-label={`Delete ${tanod.displayName || tanod.firstName}`}
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

              {activeTab === 1 && <DutyScheduler />}
              {activeTab === 2 && <AttendanceLogger />}
              {activeTab === 3 && <PatrolAreaAssignment />}
              {activeTab === 4 && <IncidentResponseLog />}
            </Box>
          </Card>
        </>
      )}

      <TanodProfileDialog
        open={profileDialogOpen}
        onClose={() => { setProfileDialogOpen(false); setSelectedTanod(null); }}
        tanod={selectedTanod}
      />

      {/* Issue #19: MUI confirm dialog instead of window.confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setTanodToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Tanod Member"
        message="Are you sure you want to delete this tanod member? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteUser.isPending}
      />
    </Stack>
  );
};

export default TanodManagement;
