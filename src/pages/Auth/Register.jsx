import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { register } from '../../services/firebaseAuthService';
import AddressSelector from '../../components/common/AddressSelector';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthLabel } from '../../utils/passwordValidator';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [address, setAddress] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    strength: 'weak',
    errors: [],
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSymbol: false,
      notCommon: false,
    },
  });

  // Issue #23: Update document title
  useEffect(() => {
    document.title = 'Create Account';
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    // Validate password in real-time
    if (field === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!address) {
      setError('Please complete your address (Province, City, and Barangay)');
      toast.error('Please complete your address');
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      toast.error('Please create a stronger password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Register with Firebase
      const userData = await register(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address: address.formatted,
        province: address.province,
        provinceCode: address.provinceCode,
        city: address.city,
        cityCode: address.cityCode,
        barangay: address.barangay,
        barangayCode: address.barangayCode,
        zipCode: address.zipCode || '',
        role: 'resident', // Default role for new registrations (barangay resident)
      });

      toast.success('Account created successfully! Please check your email for verification in your inbox.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);

      // Handle specific Firebase errors
      let errorMessage = 'Registration failed. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Stack spacing={1} alignItems="center">
          {/* Issue #6: component="h1" — Issue #13: gradient-text on page title */}
          <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
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

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
        </Stack>

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

        <AddressSelector onChange={setAddress} />

        <Stack spacing={1}>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            required
            fullWidth
            error={formData.password.length > 0 && !passwordValidation.isValid}
            helperText={formData.password.length > 0 && passwordValidation.errors[0]}
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

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Strength:
                </Typography>
                <Chip
                  label={getPasswordStrengthLabel(passwordValidation.strength)}
                  size="small"
                  color={getPasswordStrengthColor(passwordValidation.strength)}
                  variant="outlined"
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={
                  passwordValidation.strength === 'strong'
                    ? 100
                    : passwordValidation.strength === 'good'
                    ? 75
                    : passwordValidation.strength === 'fair'
                    ? 50
                    : 25
                }
                color={getPasswordStrengthColor(passwordValidation.strength)}
                sx={{ mb: 1.5, height: 6, borderRadius: 1 }}
              />

              {/* Requirements Checklist */}
              <Stack spacing={0.5}>
                <RequirementItem
                  met={passwordValidation.requirements.minLength}
                  text="At least 8 characters"
                />
                <RequirementItem
                  met={passwordValidation.requirements.hasUpperCase}
                  text="At least one uppercase letter (A-Z)"
                />
                <RequirementItem
                  met={passwordValidation.requirements.hasLowerCase}
                  text="At least one lowercase letter (a-z)"
                />
                <RequirementItem
                  met={passwordValidation.requirements.hasNumber}
                  text="At least one number (0-9)"
                />
                <RequirementItem
                  met={passwordValidation.requirements.hasSymbol}
                  text='At least one symbol (!@#$%^&*)'
                />
                <RequirementItem
                  met={passwordValidation.requirements.notCommon}
                  text="Not a common password"
                />
              </Stack>
            </Box>
          )}
        </Stack>

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

// Requirement checklist item
const RequirementItem = ({ met, text }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {met ? (
      <CheckCircle2 size={16} color="#4caf50" />
    ) : (
      <XCircle size={16} color="#f44336" />
    )}
    <Typography
      variant="caption"
      sx={{
        color: met ? '#4caf50' : '#666',
        textDecoration: met ? 'line-through' : 'none',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

export default Register;

