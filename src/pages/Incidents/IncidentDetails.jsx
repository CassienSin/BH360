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
} from '@mui/material';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // Mock data - replace with actual API call
  const incident = {
    id,
    title: 'Loud music disturbance',
    description: 'Continuous loud music from a neighbor\'s house causing disturbance to residents.',
    category: 'noise',
    priority: 'minor',
    status: 'in-progress',
    location: {
      address: 'Purok 3, Barangay Hall Area',
      coordinates: [14.5995, 120.9842],
    },
    reporterName: 'Juan Dela Cruz',
    assignedTo: 'Tanod Pedro Santos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/incidents')}
        >
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
        <Button variant="contained">
          Update Status
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={incident.category}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Box className={`status-badge ${incident.status}`}>
                      {incident.status.replace('-', ' ')}
                    </Box>
                  </Stack>
                  <Typography variant="h5" fontWeight={600}>
                    {incident.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {incident.description}
                  </Typography>
                </Stack>

                <Divider />

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
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Map View (Leaflet integration)
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
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
                    Incident Information
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Priority
                      </Typography>
                      <Chip
                        label={incident.priority}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Reported by
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {incident.reporterName}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Assigned to
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {incident.assignedTo}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {format(new Date(incident.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default IncidentDetails;

