import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MapPin, Shield, Plus, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Tooltip as MapTooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatrolArea } from '../../store/slices/tanodSlice';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';

const PatrolAreaAssignment = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { tanodMembers, patrolAreas } = useSelector((state) => state.tanod);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedTanodId, setSelectedTanodId] = useState('');

  const activeTanod = tanodMembers.filter((t) => t.status === 'active');

  const getPriorityColor = (priority) => {
    const colors = {
      high: theme.palette.error.main,
      medium: theme.palette.warning.main,
      low: theme.palette.success.main,
    };
    return colors[priority] || theme.palette.grey[500];
  };

  const getPolygonColor = (priority) => {
    const colors = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981',
    };
    return colors[priority] || '#94A3B8';
  };

  const handleAssignArea = () => {
    if (!selectedTanodId) {
      toast.error('Please select a tanod member');
      return;
    }

    const updatedArea = {
      ...selectedArea,
      assignedTanodIds: [...selectedArea.assignedTanodIds, selectedTanodId],
    };

    dispatch(updatePatrolArea(updatedArea));
    toast.success('Patrol area assigned successfully');
    setOpenDialog(false);
    setSelectedTanodId('');
  };

  const handleUnassignTanod = (areaId, tanodId) => {
    const area = patrolAreas.find((a) => a.id === areaId);
    const updatedArea = {
      ...area,
      assignedTanodIds: area.assignedTanodIds.filter((id) => id !== tanodId),
    };

    dispatch(updatePatrolArea(updatedArea));
    toast.success('Tanod unassigned from patrol area');
  };

  // Center of the map - average of all coordinates
  const mapCenter = [14.5985, 120.9852];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          Patrol Area Assignment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage patrol zones and assign tanod members
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Map View */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    Patrol Areas Map
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: theme.palette.error.main,
                      }}
                    />
                    <Typography variant="caption">High</Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: theme.palette.warning.main,
                      }}
                    />
                    <Typography variant="caption">Medium</Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: theme.palette.success.main,
                      }}
                    />
                    <Typography variant="caption">Low</Typography>
                  </Stack>
                </Stack>

                <Box sx={{ height: 500, borderRadius: 2, overflow: 'hidden' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {patrolAreas.map((area) => (
                      <Polygon
                        key={area.id}
                        positions={area.coordinates}
                        pathOptions={{
                          color: getPolygonColor(area.priority),
                          fillColor: getPolygonColor(area.priority),
                          fillOpacity: 0.3,
                          weight: 2,
                        }}
                      >
                        <MapTooltip>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {area.name}
                            </Typography>
                            <Typography variant="caption">
                              Priority: {area.priority}
                            </Typography>
                            <Typography variant="caption">
                              Assigned: {area.assignedTanodIds.length} tanod(s)
                            </Typography>
                          </Stack>
                        </MapTooltip>
                      </Polygon>
                    ))}
                  </MapContainer>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Area List */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Patrol Areas
              </Typography>
              <List sx={{ maxHeight: 530, overflow: 'auto' }}>
                {patrolAreas.map((area) => (
                  <Card
                    key={area.id}
                    elevation={0}
                    sx={{
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                          <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <MapPin size={18} color={getPriorityColor(area.priority)} />
                              <Typography variant="subtitle1" fontWeight={600}>
                                {area.name}
                              </Typography>
                            </Stack>
                            <Chip
                              label={`${area.priority} priority`}
                              size="small"
                              sx={{
                                width: 'fit-content',
                                textTransform: 'capitalize',
                                bgcolor: alpha(getPriorityColor(area.priority), 0.1),
                                color: getPriorityColor(area.priority),
                                fontWeight: 600,
                              }}
                            />
                          </Stack>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Plus size={16} />}
                            onClick={() => {
                              setSelectedArea(area);
                              setOpenDialog(true);
                            }}
                          >
                            Assign
                          </Button>
                        </Stack>

                        {area.assignedTanodIds.length > 0 ? (
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Assigned Tanod:
                            </Typography>
                            {area.assignedTanodIds.map((tanodId) => {
                              const tanod = tanodMembers.find((t) => t.id === tanodId);
                              return tanod ? (
                                <Stack
                                  key={tanodId}
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{
                                    py: 0.5,
                                    px: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: 'primary.main',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      <Shield size={12} />
                                    </Avatar>
                                    <Typography variant="body2">{tanod.fullName}</Typography>
                                  </Stack>
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleUnassignTanod(area.id, tanodId)}
                                  >
                                    Remove
                                  </Button>
                                </Stack>
                              ) : null;
                            })}
                          </Stack>
                        ) : (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                              py: 1,
                              px: 1.5,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                            }}
                          >
                            <AlertCircle size={16} color={theme.palette.warning.main} />
                            <Typography variant="body2" color="warning.main">
                              No tanod assigned
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assignment Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTanodId('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Assign Patrol Area
            </Typography>
            {selectedArea && (
              <Typography variant="body2" color="text.secondary">
                {selectedArea.name}
              </Typography>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Tanod Member</InputLabel>
              <Select
                value={selectedTanodId}
                onChange={(e) => setSelectedTanodId(e.target.value)}
                label="Select Tanod Member"
              >
                {activeTanod
                  .filter((tanod) => !selectedArea?.assignedTanodIds.includes(tanod.id))
                  .map((tanod) => (
                    <MenuItem key={tanod.id} value={tanod.id}>
                      {tanod.fullName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setSelectedTanodId('');
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleAssignArea} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PatrolAreaAssignment;
