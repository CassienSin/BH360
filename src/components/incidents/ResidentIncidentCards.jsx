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

// Mock data filtered for current user with AI analysis
const mockIncidents = [
  {
    id: '1',
    title: 'Loud music disturbance',
    category: 'noise',
    priority: 'urgent',
    status: 'in-progress',
    location: 'Purok 3, Barangay Hall Area',
    createdAt: new Date().toISOString(),
    aiAnalysis: { score: 68, confidence: 92 },
  },
  {
    id: '2',
    title: 'Broken streetlight near my house',
    category: 'hazard',
    priority: 'urgent',
    status: 'submitted',
    location: 'Main Road, Block 5',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiAnalysis: { score: 55, confidence: 88 },
  },
  {
    id: '6',
    title: 'Stray dogs in the neighborhood',
    category: 'hazard',
    priority: 'minor',
    status: 'resolved',
    location: 'Residential Area, Block 8',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    aiAnalysis: { score: 35, confidence: 82 },
  },
];

const ResidentIncidentCards = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryColor = (category) => {
    const colors = {
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
          { label: 'My Reports', value: mockIncidents.length, color: theme.palette.primary.main },
          {
            label: 'Pending',
            value: mockIncidents.filter((i) => i.status === 'submitted').length,
            color: theme.palette.info.main,
          },
          {
            label: 'In Progress',
            value: mockIncidents.filter((i) => i.status === 'in-progress').length,
            color: theme.palette.warning.main,
          },
          {
            label: 'Resolved',
            value: mockIncidents.filter((i) => i.status === 'resolved').length,
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
          ))
        ) : (
          <Grid size={12}>
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
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default ResidentIncidentCards;
