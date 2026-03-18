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
        // Issue #15: Aligned with $primary-color (#6366F1) from SCSS / theme.palette.primary
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center">
          {/* Logo */}
          <Box
            sx={{
              transform: { xs: 'scale(1.0)', sm: 'scale(1.2)' },
              mb: { xs: 0, sm: 2 },
            }}
          >
            <Logo size="large" showText={true} variant="default" />
          </Box>

          {/* Auth Form */}
          <Paper
            elevation={8}
            sx={{
              width: '100%',
              p: { xs: 3, sm: 4 },
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
