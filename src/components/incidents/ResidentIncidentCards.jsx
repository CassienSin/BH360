import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Box,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Plus, Search, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAllIncidents } from '../../hooks/useIncidents';
import { useAppSelector } from '../../store/hooks';

const ResidentIncidentCards = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch incidents from Firebase
  const { data: allIncidents = [], isLoading, error } = useAllIncidents();
  
  // Filter incidents for current user
  const myIncidents = useMemo(() => {
    return allIncidents.filter(incident => incident.userId === user?.uid);
  }, [allIncidents, user?.uid]);

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

  const filteredIncidents = useMemo(() => {
    return myIncidents.filter((incident) =>
      incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myIncidents, searchQuery]);

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="error">
        Failed to load incidents. Please check your Firebase connection.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            My Incident Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and track your submitted incident reports
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/incidents/create')}
        >
          Report New Incident
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {[
          { label: 'My Reports', value: myIncidents.length, color: theme.palette.primary.main },
          {
            label: 'Pending',
            value: myIncidents.filter((i) => i.status === 'submitted').length,
            color: theme.palette.info.main,
          },
          {
            label: 'In Progress',
            value: myIncidents.filter((i) => i.status === 'in-progress').length,
            color: theme.palette.warning.main,
          },
          {
            label: 'Resolved',
            value: myIncidents.filter((i) => i.status === 'resolved').length,
            color: theme.palette.success.main,
          },
        ].map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              minWidth: 150,
              p: 2,
              borderRadius: 3,
              background: alpha(stat.color, 0.08),
              border: `1px solid ${alpha(stat.color, 0.2)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {stat.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={stat.color} mt={0.5}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Stack>

      <TextField
        placeholder="Search your incidents..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 500 }}
      />

      <Grid container spacing={2}>
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <Box 
              key={incident.id}
              sx={{ 
                width: { xs: '100%', md: '50%', lg: '33.333%' },
                px: 1,
                mb: 2
              }}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
                onClick={() => navigate(`/incidents/${incident.id}`)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
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
                      <Box className={`status-badge ${incident.status}`}>
                        {incident.status.replace('-', ' ')}
                      </Box>
                    </Stack>

                    <Typography variant="h6" fontWeight={600}>
                      {incident.title}
                    </Typography>

                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MapPin size={16} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">
                          {incident.location}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Calendar size={16} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">
                          {incident.createdAt 
                            ? format(
                                incident.createdAt?.toDate 
                                  ? incident.createdAt.toDate() 
                                  : new Date(incident.createdAt), 
                                'MMM dd, yyyy HH:mm'
                              )
                            : 'Unknown date'
                          }
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))
        ) : (
          <Box sx={{ width: '100%', px: 1 }}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
                borderRadius: 3,
                border: `1px dashed ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No incidents found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchQuery ? 'Try adjusting your search' : "You haven't reported any incidents yet"}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => navigate('/incidents/create')}
                >
                  Report Your First Incident
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Grid>
    </Stack>
  );
};

export default ResidentIncidentCards;
