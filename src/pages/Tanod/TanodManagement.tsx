import { Stack, Typography, Button, Card, CardContent, Avatar, Grid, Box, Chip, alpha, useTheme } from '@mui/material';
import { Plus, Shield, Phone, MapPin } from 'lucide-react';

const TanodManagement = () => {
  const theme = useTheme();

  const tanodMembers = [
    {
      id: '1',
      name: 'Pedro Santos',
      status: 'on-duty',
      shift: 'day',
      patrolArea: 'Purok 1-3',
      phone: '+63 912 345 6789',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Maria Garcia',
      status: 'on-duty',
      shift: 'night',
      patrolArea: 'Purok 4-6',
      phone: '+63 923 456 7890',
      rating: 4.9,
    },
    {
      id: '3',
      name: 'Jose Reyes',
      status: 'off-duty',
      shift: 'day',
      patrolArea: 'Main Road',
      phone: '+63 934 567 8901',
      rating: 4.7,
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Tanod Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage tanod members and duty schedules
          </Typography>
        </Stack>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Add Tanod
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {tanodMembers.map((tanod) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={tanod.id}>
            <Card
              elevation={0}
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
                        {tanod.name}
                      </Typography>
                      <Chip
                        label={tanod.status.replace('-', ' ')}
                        size="small"
                        sx={{
                          width: 'fit-content',
                          backgroundColor:
                            tanod.status === 'on-duty'
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.grey[500], 0.1),
                          color:
                            tanod.status === 'on-duty'
                              ? theme.palette.success.main
                              : theme.palette.grey[600],
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MapPin size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {tanod.patrolArea}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Phone size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {tanod.phone}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Shift: {tanod.shift}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Rating: {tanod.rating}/5.0
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

export default TanodManagement;
