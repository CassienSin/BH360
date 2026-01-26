import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  alpha,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, Shield, User, UserCheck } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials, type User as UserType } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserType['role']>('resident');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data with selected role
      const mockUser = {
        id: '1',
        email,
        firstName: 'Mr.Meow',
        lastName: 'Park',
        role,
        verified: true,
      };

      const mockToken = 'mock-jwt-token';

      dispatch(setCredentials({ user: mockUser, token: mockToken }));
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case 'admin':
        return <Shield size={20} />;
      case 'tanod':
        return <UserCheck size={20} />;
      default:
        return <User size={20} />;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} className="animate-fade-in">
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account to continue
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth>
          <InputLabel>Select Role (Demo)</InputLabel>
          <Select
            value={role}
            label="Select Role (Demo)"
            onChange={(e) => setRole(e.target.value as UserType['role'])}
            startAdornment={
              <InputAdornment position="start">
                {getRoleIcon(role)}
              </InputAdornment>
            }
          >
            <MenuItem value="resident">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={18} />
                <Typography>Resident</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="admin">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield size={18} />
                <Typography>Admin</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="tanod">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserCheck size={18} />
                <Typography>Tanod</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={20} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Remember me
              </Typography>
            }
          />
          <Link
            href="#"
            variant="body2"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Forgot password?
          </Link>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            },
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Don't have an account?{' '}
          <Link
            onClick={() => navigate('/register')}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Stack>
    </form>
  );
};

export default Login;
