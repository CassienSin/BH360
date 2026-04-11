import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Box,
  TextField,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { User, Camera, Save, Home, MapPin, ShieldCheck, Eye, EyeOff, Lock, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { useUpdateUserProfile } from '../../hooks/useUsers';
import { useGeneralSettings } from '../../hooks/useSettings';
import { sendVerificationEmail, reloadCurrentUser, updateUserPassword, reauthenticate } from '../../services/firebaseAuthService';
import { ROLE_LABEL_MAP } from '../../config/roles';
import { DEFAULTS } from '../../services/settingsService';
import { validatePassword } from '../../utils/passwordValidator';

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: generalSettings } = useGeneralSettings();
  const updateProfileMutation = useUpdateUserProfile();

  const userId = user?.uid || user?.id;
  const [verificationStatusMessage, setVerificationStatusMessage] = useState('');
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isRefreshingVerification, setIsRefreshingVerification] = useState(false);

  // Change Password Dialog State
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    strength: 'weak',
    errors: [],
    requirements: {},
  });

  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    bio: '',
    address: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    barangayCode: '',
    cityCode: '',
    emergencyContact: '',
  });

  useEffect(() => {
    document.title = 'Profile – BH360';
  }, []);

  useEffect(() => {
    if (!user) return;

    setFormState({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || user.phoneNumber || '',
      email: user.email || '',
      bio: user.bio || '',
      address: user.address || '',
      barangay: user.barangay || '',
      city: user.city || '',
      province: user.province || '',
      zipCode: user.zipCode || '',
      barangayCode: user.barangayCode || '',
      cityCode: user.cityCode || '',
      emergencyContact: user.emergencyContact || '',
    });
  }, [user]);

  const handleSendVerificationEmail = async () => {
    setVerificationStatusMessage('');
    setIsSendingVerification(true);

    try {
      await sendVerificationEmail();
      toast.success('Verification email sent. Please check your inbox.');
      setVerificationStatusMessage('A verification link has been sent to your email address.');
    } catch (error) {
      console.error('Send verification email error:', error);
      setVerificationStatusMessage('Unable to send verification email. Please try again later.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleRefreshVerificationStatus = async () => {
    setVerificationStatusMessage('');
    setIsRefreshingVerification(true);

    try {
      const refreshed = await reloadCurrentUser();
      if (refreshed.emailVerified) {
        dispatch(updateUser({ emailVerified: true }));
        localStorage.setItem('user', JSON.stringify({ ...user, emailVerified: true }));
        toast.success('Email verified successfully!');
        setVerificationStatusMessage('Your email is now verified.');
      } else {
        setVerificationStatusMessage('Your email is still not verified. Please check the verification link.');
      }
    } catch (error) {
      console.error('Refresh verification status error:', error);
      setVerificationStatusMessage('Unable to refresh verification status. Please try again later.');
    } finally {
      setIsRefreshingVerification(false);
    }
  };

  // Handle Change Password
  const handleChangePasswordOpen = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordOpen(true);
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const validation = validatePassword(value);
    setPasswordValidation(validation);
  };

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword.trim()) {
      toast.error('Please enter your current password');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setChangePasswordLoading(true);
    try {
      // Reauthenticate user
      await reauthenticate(currentPassword);

      // Update password
      await updateUserPassword(newPassword);

      toast.success('Password changed successfully!');
      setChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      let errorMessage = 'Failed to change password. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      toast.error(errorMessage);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const userSince = useMemo(() => {
    if (!user?.createdAt) return 'N/A';
    const createdAt = typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt?.toDate?.();
    return createdAt ? createdAt.toLocaleDateString() : 'N/A';
  }, [user]);

  const handleChange = (field) => (event) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    const updates = {
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      phone: formState.phone.trim(),
      address: formState.address.trim(),
      barangay: formState.barangay.trim(),
      city: formState.city.trim(),
      province: formState.province.trim(),
      zipCode: formState.zipCode.trim(),
      barangayCode: formState.barangayCode.trim(),
      cityCode: formState.cityCode.trim(),
      bio: formState.bio.trim(),
      emergencyContact: formState.emergencyContact.trim(),
    };

    await updateProfileMutation.mutateAsync({ userId, updates });
    dispatch(updateUser(updates));
  };

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      formState.firstName !== (user.firstName || '') ||
      formState.lastName !== (user.lastName || '') ||
      formState.phone !== (user.phone || user.phoneNumber || '') ||
      formState.address !== (user.address || '') ||
      formState.barangay !== (user.barangay || '') ||
      formState.city !== (user.city || '') ||
      formState.province !== (user.province || '') ||
      formState.zipCode !== (user.zipCode || '') ||
      formState.emergencyContact !== (user.emergencyContact || '') ||
      formState.bio !== (user.bio || '')
    );
  }, [formState, user]);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
          My Barangay Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and update your personal details, barangay residency, and community profile.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Box sx={{ flex: { xs: 1, lg: '0 0 30%' } }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Stack position="relative">
                  <Avatar src={user?.profileImage} sx={{ width: 120, height: 120 }}>
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
                    {ROLE_LABEL_MAP[user?.role] || user?.role}
                  </Typography>
                  <Chip
                    label={user?.barangay ? `${user.barangay}, ${user.city}` : 'Barangay not set'}
                    size="small"
                    icon={<MapPin size={14} />}
                    sx={{ mt: 1, textTransform: 'capitalize' }}
                  />
                </Stack>

                <Stack spacing={1} width="100%">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShieldCheck size={16} />
                    <Typography variant="body2" color="text.secondary">
                      User since {userSince}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Home size={16} />
                    <Typography variant="body2" color="text.secondary">
                      {user?.barangay || generalSettings?.name || 'Barangay Office'}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={600}>
                  Barangay Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Barangay:</strong> {user?.barangay || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>City:</strong> {user?.city || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Province:</strong> {user?.province || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Zip Code:</strong> {user?.zipCode || DEFAULTS.general.zipCode}
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
                    <TextField
                      label="First Name"
                      value={formState.firstName}
                      onChange={handleChange('firstName')}
                      fullWidth
                    />
                    <TextField
                      label="Last Name"
                      value={formState.lastName}
                      onChange={handleChange('lastName')}
                      fullWidth
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Role" value={ROLE_LABEL_MAP[user?.role] || user?.role} fullWidth disabled />
                    <TextField label="Email" value={formState.email} fullWidth disabled />
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mt: 1, flexDirection: 'column', gap: 1 }}>
                    <Chip
                      icon={<ShieldCheck size={16} />}
                      label={user?.emailVerified ? 'Email verified' : 'Email not verified'}
                      color={user?.emailVerified ? 'success' : 'warning'}
                      size="small"
                    />

                    {user?.falseReportWarnings > 0 && (
                      <Alert severity={user?.blacklisted ? 'error' : 'warning'}>
                        {user?.blacklisted
                          ? `This account is blacklisted for repeated false reports (${user.falseReportWarnings} warnings).`
                          : `This account has ${user.falseReportWarnings} false-report warning(s). Three warnings will result in blacklist.`}
                      </Alert>
                    )}

                    {!user?.emailVerified && (
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Your email is not verified yet. You can verify it here when ready.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <Button
                            variant="contained"
                            onClick={handleSendVerificationEmail}
                            disabled={isSendingVerification}
                          >
                            {isSendingVerification ? <CircularProgress size={18} color="inherit" /> : 'Send Verification Email'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleRefreshVerificationStatus}
                            disabled={isRefreshingVerification}
                          >
                            {isRefreshingVerification ? <CircularProgress size={18} color="inherit" /> : 'Refresh Status'}
                          </Button>
                        </Stack>
                        {verificationStatusMessage && (
                          <Alert severity="info">{verificationStatusMessage}</Alert>
                        )}
                      </Stack>
                    )}
                  </Box>

                  <TextField
                    value={formState.phone}
                    onChange={handleChange('phone')}
                    fullWidth
                  />

                  <TextField
                    label="Barangay Address"
                    value={formState.address}
                    onChange={handleChange('address')}
                    multiline
                    rows={2}
                    fullWidth
                  />

                  <TextField
                    label="Zip Code"
                    value={formState.zipCode}
                    onChange={handleChange('zipCode')}
                    fullWidth
                  />

                  <TextField
                    label="About Me"
                    value={formState.bio}
                    onChange={handleChange('bio')}
                    multiline
                    rows={3}
                    placeholder="Share a little about your barangay involvement or personal profile"
                    fullWidth
                  />

                  <TextField
                    label="Emergency Contact"
                    value={formState.emergencyContact}
                    onChange={handleChange('emergencyContact')}
                    helperText="Family member or barangay contact in case of emergency"
                    fullWidth
                  />
                </Stack>

                {updateProfileMutation.isError && (
                  <Alert severity="error">Unable to save profile. Please try again.</Alert>
                )}

                  <Divider />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => setFormState({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    phone: user?.phone || user?.phoneNumber || '',
                    email: user?.email || '',
                    bio: user?.bio || '',
                    address: user?.address || '',
                    barangay: user?.barangay || '',
                    city: user?.city || '',
                    province: user?.province || '',
                    zipCode: user?.zipCode || '',
                    barangayCode: user?.barangayCode || '',
                    cityCode: user?.cityCode || '',
                    emergencyContact: user?.emergencyContact || '',
                  })}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={updateProfileMutation.isLoading ? <CircularProgress size={18} color="inherit" /> : <Save size={20} />}
                    onClick={handleSave}
                    disabled={!hasChanges || updateProfileMutation.isLoading}
                  >
                    Save Changes
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Security
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your account security and password settings
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Lock size={20} />}
                    onClick={handleChangePasswordOpen}
                    fullWidth
                  >
                    Change Password
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Change Password
            </Typography>
            <IconButton
              size="small"
              onClick={() => setChangePasswordOpen(false)}
              disabled={changePasswordLoading}
            >
              <X size={18} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enter your current password and a new strong password to update your account security.
            </Typography>

            {/* Current Password */}
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              fullWidth
              disabled={changePasswordLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      disabled={changePasswordLoading}
                      size="small"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Divider />

            {/* New Password */}
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
              fullWidth
              disabled={changePasswordLoading}
              error={newPassword.length > 0 && !passwordValidation.isValid}
              helperText={newPassword.length > 0 && passwordValidation.errors[0]}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      disabled={changePasswordLoading}
                      size="small"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm New Password */}
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              disabled={changePasswordLoading}
              error={confirmPassword.length > 0 && newPassword !== confirmPassword}
              helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
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
                      disabled={changePasswordLoading}
                      size="small"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Requirements Note */}
            {newPassword.length > 0 && (
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                Your password must be at least 8 characters with uppercase, lowercase, number, and symbol
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setChangePasswordOpen(false)}
            disabled={changePasswordLoading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              changePasswordLoading ||
              !currentPassword.trim() ||
              !passwordValidation.isValid ||
              newPassword !== confirmPassword
            }
            fullWidth
          >
            {changePasswordLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Profile;

