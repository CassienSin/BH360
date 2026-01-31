/**
 * Data Seeding Page
 * Administrative page to seed sample data into Firebase for testing
 */

import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Database, Users, AlertCircle, Calendar, Clock, Trash2, CheckCircle } from 'lucide-react';
import {
  seedAllData,
  seedTanodUsers,
  seedIncidents,
  seedSchedules,
  seedAttendance,
  clearAllData,
} from '../../utils/seedData';

const DataSeeding = () => {
  const [loading, setLoading] = useState(false);
  const [seededData, setSeededData] = useState(null);

  const handleSeedAll = async () => {
    setLoading(true);
    try {
      const result = await seedAllData();
      setSeededData(result);
    } catch (error) {
      console.error('Seeding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedIndividual = async (seedFunction, name) => {
    setLoading(true);
    try {
      await seedFunction();
    } catch (error) {
      console.error(`Error seeding ${name}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Data Seeding & Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Populate your Firebase database with sample data for testing
        </Typography>
      </Stack>

      <Alert severity="warning">
        <AlertTitle>Important Notice</AlertTitle>
        This page is for development and testing purposes only. Make sure you are connected to a test Firebase project
        before seeding data.
      </Alert>

      {/* Seed All Data Card */}
      <Card elevation={0} sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: (theme) => `${theme.palette.primary.main}15`,
                  display: 'inline-flex',
                }}
              >
                <Database size={28} color="#3457D5" />
              </Box>
              <Stack flexGrow={1}>
                <Typography variant="h6" fontWeight={600}>
                  Seed Complete Dataset
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Populates all collections with sample data in the correct order
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="subtitle2" fontWeight={600}>
              This will create:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Users size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="4 Tanod Members"
                  secondary="Sample tanod profiles with roles and qualifications"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AlertCircle size={20} />
                </ListItemIcon>
                <ListItemText primary="8 Incidents" secondary="Various incident types with different priorities" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Calendar size={20} />
                </ListItemIcon>
                <ListItemText primary="3 Duty Schedules" secondary="Current and upcoming shift assignments" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Clock size={20} />
                </ListItemIcon>
                <ListItemText primary="3 Attendance Records" secondary="Recent check-in/check-out logs" />
              </ListItem>
            </List>

            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Database size={20} />}
              onClick={handleSeedAll}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Seeding Data...' : 'Seed All Sample Data'}
            </Button>

            {seededData && (
              <Alert severity="success" icon={<CheckCircle size={20} />}>
                <AlertTitle>Success!</AlertTitle>
                All sample data has been created successfully. You can now explore the application with real data.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Individual Seeding Options */}
      <Card elevation={0} sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Individual Data Seeding
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Seed specific collections independently (Note: Some data depends on others)
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Users size={20} />}
              onClick={() => handleSeedIndividual(seedTanodUsers, 'Tanod Users')}
              disabled={loading}
              fullWidth
            >
              Seed Tanod Members Only
            </Button>

            <Button
              variant="outlined"
              startIcon={<AlertCircle size={20} />}
              onClick={() => handleSeedIndividual(seedIncidents, 'Incidents')}
              disabled={loading}
              fullWidth
            >
              Seed Incidents Only
            </Button>

            <Button
              variant="outlined"
              startIcon={<Calendar size={20} />}
              onClick={() => handleSeedIndividual(seedSchedules, 'Schedules')}
              disabled={loading}
              fullWidth
            >
              Seed Schedules Only (requires Tanod members)
            </Button>

            <Button
              variant="outlined"
              startIcon={<Clock size={20} />}
              onClick={() => handleSeedIndividual(seedAttendance, 'Attendance')}
              disabled={loading}
              fullWidth
            >
              Seed Attendance Only (requires Tanod members)
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Clear Data Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.error.main}`,
          backgroundColor: (theme) => `${theme.palette.error.main}08`,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: (theme) => `${theme.palette.error.main}15`,
                  display: 'inline-flex',
                }}
              >
                <Trash2 size={24} color="#d32f2f" />
              </Box>
              <Stack flexGrow={1}>
                <Typography variant="h6" fontWeight={600} color="error">
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clear all data from Firebase (use with extreme caution)
                </Typography>
              </Stack>
            </Stack>

            <Alert severity="error">
              This action cannot be undone. Please use the Firebase Console to manually delete collections for safety.
            </Alert>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={20} />}
              onClick={clearAllData}
              disabled={loading}
            >
              Clear All Data
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card elevation={0} sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            1. Make sure your Firebase credentials are correctly configured in the <code>.env</code> file
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            2. Use "Seed All Sample Data" to populate your database with a complete dataset
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            3. Individual seeding options are useful for adding more data to existing collections
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            4. After seeding, navigate to different pages to see the data in action
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5. To clear data, use the Firebase Console at{' '}
            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
              console.firebase.google.com
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DataSeeding;
