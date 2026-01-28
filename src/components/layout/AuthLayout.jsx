import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Stack } from '@mui/material';
import Logo from '../common/Logo';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3457D5 0%, #4682b4 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center">
          {/* Logo */}
          <Box
            sx={{
              transform: 'scale(1.2)',
              mb: 2,
            }}
          >
            <Logo size="large" showText={true} variant="default" />
          </Box>

          {/* Auth Form */}
          <Paper
            elevation={8}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 3,
            }}
          >
            <Outlet />
          </Paper>

          {/* Footer Text */}
          <Box
            component="p"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              fontSize: '0.875rem',
              m: 0,
            }}
          >
            © 2026 BH360. Empowering barangays with smart governance.
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default AuthLayout;
