import { Stack, Typography, Card, CardContent, Avatar, Button, Grid, TextField, Divider } from '@mui/material';
import { User, Camera, Save } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account information
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: { xs: 1, md: '0 0 33.333%' } }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Stack position="relative">
                  <Avatar
                    src={user?.profileImage}
                    sx={{ width: 120, height: 120 }}
                  >
                    <User size={48} />
                  </Avatar>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      minWidth: 'auto',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      p: 0,
                    }}
                  >
                    <Camera size={18} />
                  </Button>
                </Stack>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                    {user?.role}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>
                  Personal Information
                </Typography>

                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="First Name" defaultValue={user?.firstName} fullWidth />
                    <TextField label="Last Name" defaultValue={user?.lastName} fullWidth />
                  </Stack>
                  <TextField label="Email" type="email" defaultValue={user?.email} fullWidth />
                  <TextField label="Phone Number" defaultValue={user?.phoneNumber} fullWidth />
                  <TextField
                    label="Address"
                    defaultValue={user?.address}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined">Cancel</Button>
                  <Button variant="contained" startIcon={<Save size={20} />}>
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Profile;

