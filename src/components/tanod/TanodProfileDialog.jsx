import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Chip,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { X, Shield, Plus } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { useCreateTanodProfile, useUpdateTanodProfile } from '../../hooks/useTanod';

const TanodProfileDialog = ({ open, onClose, tanod = null }) => {
  const isEdit = Boolean(tanod);

  const createProfile = useCreateTanodProfile();
  const updateProfile = useUpdateTanodProfile();
  const isSaving = createProfile.isPending || updateProfile.isPending;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    qualifications: [],
    status: 'active',
  });

  const [newQualification, setNewQualification] = useState('');

  useEffect(() => {
    if (tanod) {
      setFormData({
        firstName: tanod.firstName || '',
        lastName: tanod.lastName || '',
        email: tanod.email || '',
        phone: tanod.phone || '',
        dateOfBirth: tanod.dateOfBirth ? new Date(tanod.dateOfBirth) : null,
        address: tanod.address || '',
        emergencyContactName: tanod.emergencyContact?.name || '',
        emergencyContactRelationship: tanod.emergencyContact?.relationship || '',
        emergencyContactPhone: tanod.emergencyContact?.phone || '',
        qualifications: tanod.qualifications || [],
        status: tanod.status || 'active',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: null,
        address: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        qualifications: [],
        status: 'active',
      });
    }
  }, [tanod, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()],
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const tanodData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: `${formData.firstName} ${formData.lastName}`,
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
      address: formData.address,
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        phone: formData.emergencyContactPhone,
      },
      qualifications: formData.qualifications,
      status: formData.status,
      role: 'tanod',
    };

    try {
      if (isEdit) {
        await updateProfile.mutateAsync({ tanodId: tanod.id, updates: tanodData });
      } else {
        await createProfile.mutateAsync({
          ...tanodData,
          currentShift: 'off',
          assignedAreas: [],
          dateJoined: new Date().toISOString(),
          rating: 0,
          totalIncidentsResponded: 0,
          totalDutyHours: 0,
        });
      }
      onClose();
    } catch (err) {
      console.error('[TanodProfileDialog] submit error:', err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={isSaving ? undefined : onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                <Shield size={24} />
              </Avatar>
              <Stack>
                <Typography variant="h5" fontWeight={700}>
                  {isEdit ? 'Edit Tanod Profile' : 'Add New Tanod'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEdit
                    ? 'Update tanod member information'
                    : 'Fill in the details to add a new tanod member'}
                </Typography>
              </Stack>
            </Stack>
            <IconButton onClick={onClose} disabled={isSaving}>
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Personal Information */}
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="+63 912 345 6789"
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(date) => handleChange('dateOfBirth', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <Autocomplete
                  fullWidth
                  options={['active', 'inactive', 'on-leave']}
                  value={formData.status}
                  onChange={(e, value) => handleChange('status', value || 'active')}
                  renderInput={(params) => <TextField {...params} label="Status" />}
                  getOptionLabel={(option) =>
                    option
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')
                  }
                />
              </Stack>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Stack>

            <Divider />

            {/* Emergency Contact */}
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>Emergency Contact</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </Stack>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                placeholder="+63 912 345 6789"
              />
            </Stack>

            <Divider />

            {/* Qualifications */}
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Qualifications & Certifications
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  label="Add Qualification"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQualification();
                    }
                  }}
                  placeholder="e.g., First Aid Certified"
                />
                <Button
                  variant="contained"
                  onClick={handleAddQualification}
                  startIcon={<Plus size={18} />}
                  sx={{ minWidth: 120 }}
                >
                  Add
                </Button>
              </Stack>
              {formData.qualifications.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.qualifications.map((qual, index) => (
                    <Chip
                      key={index}
                      label={qual}
                      onDelete={() => handleRemoveQualification(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined" disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSaving ? 'Saving…' : isEdit ? 'Update Profile' : 'Add Tanod'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TanodProfileDialog;
