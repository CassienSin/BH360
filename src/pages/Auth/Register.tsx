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
  Grid,
  Alert,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register as a barangay resident
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <TextField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
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
          label="Phone Number"
          value={formData.phone}
          onChange={handleChange('phone')}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone size={20} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Address"
          value={formData.address}
          onChange={handleChange('address')}
          required
          fullWidth
          multiline
          rows={2}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', pt: 1.5 }}>
                <MapPin size={20} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange('password')}
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

        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already have an account?{' '}
          <Link
            onClick={() => navigate('/login')}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Stack>
    </form>
  );
};

export default Register;
