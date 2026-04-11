import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import {
  sendVerificationEmail,
  updateUserEmail,
  reauthenticate,
  reloadCurrentUser,
} from '../../services/firebaseAuthService';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    document.title = 'Verify Email – BH360';
    if (user?.emailVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const currentEmail = user?.email || '';
  const isVerified = user?.emailVerified;

  const handleResendVerification = async () => {
    setStatusMessage('');
    setIsSending(true);
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setStatusMessage('Failed to send verification email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setStatusMessage('');
    setIsRefreshing(true);
    try {
      const refreshed = await reloadCurrentUser();
      if (refreshed.emailVerified) {
        const updatedUser = { ...user, emailVerified: true };
        dispatch(updateUser({ emailVerified: true }));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Email verified successfully! Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        setStatusMessage('Your email is still not verified. Please check the verification link.');
      }
    } catch (error) {
      console.error('Refresh verification status error:', error);
      setStatusMessage('Unable to refresh verification status. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEmailChange = async () => {
    setStatusMessage('');
    if (!newEmail.trim()) {
      setStatusMessage('Please enter the new email address you want to use.');
      return;
    }
    if (!password.trim()) {
      setStatusMessage('Please enter your current password to update your email.');
      return;
    }

    setIsUpdating(true);
    try {
      await reauthenticate(password.trim());
      await updateUserEmail(newEmail.trim());
      const updatedUser = {
        ...user,
        email: newEmail.trim(),
        emailVerified: false,
      };
      dispatch(updateUser({ email: newEmail.trim(), emailVerified: false }));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setNewEmail('');
      setPassword('');
      toast.success('Email updated. A verification link has been sent to your new address.');
    } catch (error) {
      console.error('Change email error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setStatusMessage('Please sign out and sign in again before changing your email.');
      } else if (error.code === 'auth/invalid-email') {
        setStatusMessage('The new email address is invalid.');
      } else if (error.code === 'auth/email-already-in-use') {
        setStatusMessage('This email address is already in use.');
      } else if (error.code === 'auth/wrong-password') {
        setStatusMessage('The password entered is incorrect.');
      } else {
        setStatusMessage('Failed to update email. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
        Verify Your Email
      </Typography>
      <Typography variant="body2" color="text.secondary">
        We need to confirm your email before you can use the system. Your current email is shown below.
      </Typography>

      <Card className="glass">
        <CardContent>
          <Stack spacing={3}>
            {isVerified ? (
              <Alert severity="success">Your email is already verified.</Alert>
            ) : (
              <Alert severity="warning">
                Your email is not verified yet. Please verify using the link sent to your inbox.
              </Alert>
            )}

            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Current Email
              </Typography>
              <Typography variant="body1">{currentEmail}</Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                disabled={isSending}
                onClick={handleResendVerification}
              >
                {isSending ? <CircularProgress size={18} color="inherit" /> : 'Resend Verification Email'}
              </Button>
              <Button
                variant="outlined"
                disabled={isRefreshing}
                onClick={handleRefreshStatus}
              >
                {isRefreshing ? <CircularProgress size={18} color="inherit" /> : 'I Verified My Email'}
              </Button>
            </Stack>

            <Box>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Change Email Address
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                If you want to use a different email, enter it below and confirm with your current password.
              </Typography>
              <TextField
                label="New Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Current Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={isUpdating}
                onClick={handleEmailChange}
              >
                {isUpdating ? <CircularProgress size={18} color="inherit" /> : 'Change Email and Send Verification'}
              </Button>
            </Box>

            {statusMessage && <Alert severity="info">{statusMessage}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default VerifyEmail;
