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
  Checkbox,
  FormControlLabel,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { signIn, resetPassword } from '../../services/firebaseAuthService';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Issue #8: Forgot password dialog state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Issue #23: Update document title
  useEffect(() => {
    document.title = 'Sign In';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await signIn(email, password);
      const token = userData.uid;

      dispatch(setCredentials({ user: userData, token }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      if (userData.emailVerified) {
        toast.success('Welcome back!');
      } else {
        toast.info('Welcome back! You can verify your email later from your Profile.');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Invalid email or password';
      if (err.code === 'auth/user-not-found') errorMessage = 'No account found with this email';
      else if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      else if (err.code === 'auth/too-many-requests') errorMessage = 'Too many failed attempts. Please try again later';
      else if (err.code === 'auth/network-request-failed') errorMessage = 'Network error. Please check your connection';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Issue #8: Functional forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      toast.success('Password reset email sent. Please check your inbox.');
      setForgotOpen(false);
      setForgotEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email address';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3} className="animate-fade-in">
          <Stack spacing={1} alignItems="center">
            {/* Issue #6: component="h1" for the page title */}
            <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary" noWrap>
                  Remember me
                </Typography>
              }
              sx={{ flexShrink: 0 }}
            />
            {/* Issue #8: Link now opens the forgot-password dialog */}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setForgotOpen(true)}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot password?
            </Link>
          </Stack>

          {/* Issue #14: Use 'gradient' theme variant instead of inline sx gradient */}
          <Button
            type="submit"
            variant="gradient"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
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

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleForgotPassword}>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                Reset Password
              </Typography>
              <IconButton
                size="small"
                onClick={() => setForgotOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                label="Email Address"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                fullWidth
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button variant="outlined" onClick={() => setForgotOpen(false)} disabled={forgotLoading} fullWidth>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={forgotLoading} fullWidth>
              {forgotLoading ? 'Sending…' : 'Send Reset Email'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Login;
