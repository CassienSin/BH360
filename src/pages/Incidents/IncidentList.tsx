import { useState } from 'react';
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
} from '@mui/material';
import { Plus, Search, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const mockIncidents = [
  {
    id: '1',
    title: 'Loud music disturbance',
    category: 'noise',
    priority: 'minor',
    status: 'in-progress',
    location: 'Purok 3, Barangay Hall Area',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Broken streetlight',
    category: 'hazard',
    priority: 'medium',
    status: 'submitted',
    location: 'Main Road, Block 5',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Suspicious person',
    category: 'crime',
    priority: 'high',
    status: 'resolved',
    location: 'Corner of Main St & 2nd Ave',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const IncidentList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      crime: theme.palette.error.main,
      noise: theme.palette.warning.main,
      hazard: theme.palette.info.main,
      dispute: theme.palette.secondary.main,
    };
    return colors[category] || theme.palette.grey[500];
  };

  const filteredIncidents = mockIncidents.filter((incident) =>
    incident.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Incidents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track barangay incidents
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/incidents/create')}
        >
          Report Incident
        </Button>
      </Stack>

      <TextField
        placeholder="Search incidents..."
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
        {filteredIncidents.map((incident) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={incident.id}>
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
                        {format(new Date(incident.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default IncidentList;
