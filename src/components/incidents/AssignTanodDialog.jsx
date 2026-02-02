import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Box,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import { Search, User, MapPin, Clock, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllTanods } from '../../hooks/useTanod';
import { useAssignIncident } from '../../hooks/useIncidents';

const AssignTanodDialog = ({ open, onClose, incident }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTanodId, setSelectedTanodId] = useState(incident?.assignedTo || '');
  
  // Fetch all tanods from Firebase
  const { data: tanods = [], isLoading, error } = useAllTanods();
  
  // Mutation for assigning incident
  const assignIncidentMutation = useAssignIncident();

  // Filter tanods based on search
  const filteredTanods = useMemo(() => {
    if (!searchQuery) return tanods;
    
    const query = searchQuery.toLowerCase();
    return tanods.filter((tanod) => {
      const searchableText = [
        tanod.displayName,
        tanod.firstName,
        tanod.lastName,
        tanod.email,
        ...(tanod.assignedAreas || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      return searchableText.includes(query);
    });
  }, [tanods, searchQuery]);

  // Filter only active tanods
  const activeTanods = useMemo(() => {
    return filteredTanods.filter((tanod) => tanod.status === 'active');
  }, [filteredTanods]);

  const handleAssign = async () => {
    if (!selectedTanodId) {
      toast.error('Please select a tanod to assign');
      return;
    }

    try {
      await assignIncidentMutation.mutateAsync({
        incidentId: incident.id,
        tanodId: selectedTanodId,
      });
      onClose();
    } catch (error) {
      console.error('Error assigning tanod:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'on-leave':
        return theme.palette.warning.main;
      case 'inactive':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack spacing={1}>
          <Typography variant="h6" fontWeight={700}>
            Assign Tanod to Incident
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a tanod member to handle this incident
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {/* Search Field */}
          <TextField
            placeholder="Search by name, area, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />

          {/* Loading State */}
          {isLoading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error">
              Failed to load tanod members. Please try again.
            </Alert>
          )}

          {/* Tanod List */}
          {!isLoading && !error && (
            <>
              {activeTanods.length === 0 ? (
                <Alert severity="info">
                  No active tanod members found. {searchQuery && 'Try a different search term.'}
                </Alert>
              ) : (
                <RadioGroup value={selectedTanodId} onChange={(e) => setSelectedTanodId(e.target.value)}>
                  <Stack spacing={1}>
                    {activeTanods.map((tanod) => (
                      <Box
                        key={tanod.id}
                        sx={{
                          border: `2px solid ${
                            selectedTanodId === tanod.id
                              ? theme.palette.primary.main
                              : theme.palette.divider
                          }`,
                          borderRadius: 2,
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor:
                            selectedTanodId === tanod.id
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          },
                        }}
                        onClick={() => setSelectedTanodId(tanod.id)}
                      >
                        <FormControlLabel
                          value={tanod.id}
                          control={<Radio />}
                          sx={{ width: '100%', m: 0 }}
                          label={
                            <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
                              <Avatar
                                src={tanod.photoURL}
                                alt={tanod.displayName || tanod.firstName}
                                sx={{ width: 48, height: 48 }}
                              >
                                {(tanod.displayName || tanod.firstName || 'T')[0].toUpperCase()}
                              </Avatar>
                              
                              <Stack spacing={0.5} flexGrow={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {tanod.displayName || `${tanod.firstName || ''} ${tanod.lastName || ''}`.trim() || 'Tanod Member'}
                                  </Typography>
                                  <Chip
                                    label={tanod.status || 'active'}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      backgroundColor: alpha(getStatusColor(tanod.status), 0.1),
                                      color: getStatusColor(tanod.status),
                                      textTransform: 'capitalize',
                                    }}
                                  />
                                </Stack>
                                
                                <Stack direction="row" spacing={2} flexWrap="wrap">
                                  {tanod.currentShift && (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <Clock size={14} color={theme.palette.text.secondary} />
                                      <Typography variant="caption" color="text.secondary">
                                        {tanod.currentShift} shift
                                      </Typography>
                                    </Stack>
                                  )}
                                  
                                  {tanod.assignedAreas && tanod.assignedAreas.length > 0 && (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <MapPin size={14} color={theme.palette.text.secondary} />
                                      <Typography variant="caption" color="text.secondary">
                                        {tanod.assignedAreas[0]}
                                        {tanod.assignedAreas.length > 1 && ` +${tanod.assignedAreas.length - 1}`}
                                      </Typography>
                                    </Stack>
                                  )}
                                  
                                  {tanod.rating && (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <Award size={14} color={theme.palette.text.secondary} />
                                      <Typography variant="caption" color="text.secondary">
                                        {tanod.rating.toFixed(1)} rating
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>
                                
                                {tanod.totalIncidentsResponded !== undefined && (
                                  <Typography variant="caption" color="text.secondary">
                                    {tanod.totalIncidentsResponded} incidents handled
                                  </Typography>
                                )}
                              </Stack>
                            </Stack>
                          }
                        />
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={assignIncidentMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedTanodId || assignIncidentMutation.isPending}
          startIcon={assignIncidentMutation.isPending ? <CircularProgress size={16} /> : <User size={18} />}
        >
          {assignIncidentMutation.isPending ? 'Assigning...' : 'Assign Tanod'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTanodDialog;
