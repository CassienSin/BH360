import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Box,
  useTheme,
  Chip,
  alpha,
  Alert,
  AlertTitle,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Avatar,
  Divider,
  FormLabel,
  RadioGroup,
  Radio,
  LinearProgress,
} from '@mui/material';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Image as ImageIcon,
  Loader,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import { classifyIncident, calculatePriorityScore, suggestResponseActions } from '../../services/aiService';
import ResponseSuggestions from '../../components/ai/ResponseSuggestions';
import { useCreateIncident, useAllIncidents } from '../../hooks/useIncidents';
import { useAppSelector } from '../../store/hooks';

const CATEGORY_DESCRIPTIONS = {
  crime: 'Criminal activities, theft, robbery, assault',
  noise: 'Excessive noise, loud music, disturbance',
  fire: 'Fire incidents, smoke, fire hazards',
  dispute: 'Neighborhood disputes, conflicts',
  hazard: 'Dangerous conditions, structural issues',
  health: 'Health emergencies, accidents',
  utility: 'Water, electricity, street, utility issues',
  other: 'Other issues not listed above',
};

const CATEGORY_COLORS = {
  crime: 'error',
  noise: 'warning',
  fire: 'error',
  dispute: 'secondary',
  hazard: 'info',
  health: 'error',
  utility: 'info',
  other: 'default',
};

const IncidentCreate = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const createIncident = useCreateIncident();
  const { data: allIncidents = [] } = useAllIncidents();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
    coordinates: null,
    requestedAction: 'investigation', // immediate, investigation, patrol, documentation
    anonymous: false,
  });

  const [aiClassification, setAiClassification] = useState(null);
  const [aiPriority, setAiPriority] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiInsights, setShowAiInsights] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'video/*': ['.mp4', '.mov'],
    },
    maxFiles: 5,
  });

  useEffect(() => {
    document.title = 'Report Incident – BH360';
  }, []);

  // Get reporter name and contact from user profile
  const reporterName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous';
  const reporterContact = user?.email || user?.phone || '';
  const userBarangay = user?.barangay || 'Unknown';

  // AI Classification when title and description change
  useEffect(() => {
    if (formData.title.length > 5 && formData.description.length > 10) {
      const classification = classifyIncident(formData.title, formData.description);
      setAiClassification(classification);

      if (classification.confidence >= 60 && !formData.category) {
        setFormData(prev => ({ ...prev, category: classification.category }));
      }
    }
  }, [formData.title, formData.description]);

  // AI Priority Scoring
  useEffect(() => {
    if (formData.title && formData.description && formData.category && formData.location) {
      const incidentData = {
        ...formData,
        createdAt: new Date().toISOString()
      };
      const priorityResult = calculatePriorityScore(incidentData);
      setAiPriority(priorityResult);

      if (!formData.priority) {
        setFormData(prev => ({ ...prev, priority: priorityResult.priority }));
      }

      const suggestions = suggestResponseActions({
        ...incidentData,
        priority: priorityResult.priority
      });
      setAiSuggestions(suggestions);
      setShowAiInsights(true);
    }
  }, [formData.title, formData.description, formData.category, formData.location]);

  // Find related incidents (same category or nearby area)
  const relatedIncidents = useMemo(() => {
    return allIncidents
      .filter(incident =>
        (incident.category === formData.category) &&
        incident.status !== 'false-report' &&
        incident.id !== formData.id
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [allIncidents, formData.category, formData.id]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    // Format location with coordinates if available
    const displayLocation = `${address.barangay}, ${address.city} (${address.province})`;
    setFormData(prev => ({
      ...prev,
      location: displayLocation,
    }));
  };

  const handleMapCoordinateSelect = (coord) => {
    setMapCoordinates(coord);

    // Format coordinates as part of location string for map display
    const coordStr = `(${coord[0].toFixed(6)}, ${coord[1].toFixed(6)})`;

    // Update location with coordinates
    setFormData(prev => {
      const locationWithoutCoords = prev.location.split('(')[0].trim() || 'Custom Location';
      return {
        ...prev,
        location: `${locationWithoutCoords} ${coordStr}`,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.blacklisted) {
      toast.error('Your account is blocked from submitting reports.');
      return;
    }

    setVerificationDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const incidentData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority || aiPriority?.priority || 'medium',
        location: formData.location,
        reporterName: formData.anonymous ? 'Anonymous' : reporterName,
        reporterContact: formData.anonymous ? '' : reporterContact,
        userId: user?.uid || null,
        requestedAction: formData.requestedAction,
        anonymous: formData.anonymous,
        status: 'submitted',
        aiAnalysis: {
          classification: aiClassification,
          priorityScore: aiPriority,
          suggestions: aiSuggestions,
        },
      };

      await createIncident.mutateAsync(incidentData);
      setVerificationDialogOpen(false);
      navigate('/incidents');
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  // Block if user is blacklisted
  if (user?.blacklisted) {
    return (
      <Stack spacing={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          size="small"
          onClick={() => navigate('/incidents')}
          sx={{ width: 'fit-content' }}
        >
          Back
        </Button>

        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <AlertTitle>Account Blocked</AlertTitle>
          <Typography variant="body2" paragraph>
            Your account has been blocked from submitting incident reports due to repeated false reports.
          </Typography>
          <Typography variant="body2" color="inherit">
            If you believe this is incorrect, you can request an appeal through your profile settings.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => navigate('/profile')}
          >
            View Appeal Status
          </Button>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          size="small"
          onClick={() => navigate('/incidents')}
          sx={{ flexShrink: 0 }}
        >
          Back
        </Button>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          className="gradient-text"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' } }}
        >
          Report New Incident
        </Typography>
      </Stack>

      {/* User Warning Status */}
      {user?.falseReportWarnings > 0 && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <AlertTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <AlertTriangle size={18} />
              <span>Account Warning</span>
            </Stack>
          </AlertTitle>
          <Typography variant="body2">
            You have <strong>{user.falseReportWarnings}</strong> false report warning(s).
            {user.falseReportWarnings >= 2 && ' One more warning will result in account suspension.'}
          </Typography>
        </Alert>
      )}

      {/* User Profile Card */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.main,
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {reporterName.charAt(0)}
            </Avatar>
            <Stack spacing={0.5} flex={1}>
              <Typography variant="h6" fontWeight={700}>
                {reporterName}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  📍 {userBarangay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📧 {reporterContact}
                </Typography>
              </Stack>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                />
              }
              label="Report anonymously"
              sx={{ mb: 0, whiteSpace: 'nowrap' }}
            />
          </Stack>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Quick Info - Category & Priority */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={3}>
                {/* Category Selection */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Category
                  </Typography>
                  <Stack spacing={1.5}>
                    <Grid container spacing={1}>
                      {Object.entries(CATEGORY_DESCRIPTIONS).map(([key, desc]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box
                            onClick={() => setFormData({ ...formData, category: key })}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: `2px solid ${
                                formData.category === key
                                  ? theme.palette[CATEGORY_COLORS[key]]?.main || theme.palette.grey[500]
                                  : theme.palette.divider
                              }`,
                              backgroundColor:
                                formData.category === key
                                  ? alpha(theme.palette[CATEGORY_COLORS[key]]?.main || theme.palette.grey[500], 0.08)
                                  : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: theme.palette[CATEGORY_COLORS[key]]?.main || theme.palette.grey[500],
                                backgroundColor: alpha(
                                  theme.palette[CATEGORY_COLORS[key]]?.main || theme.palette.grey[500],
                                  0.05
                                ),
                              },
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: theme.palette[CATEGORY_COLORS[key]]?.main || theme.palette.grey[500],
                                  flexShrink: 0,
                                  mt: 0.5,
                                }}
                              />
                              <Stack spacing={0.5} flex={1}>
                                <Typography
                                  variant="body2"
                                  fontWeight={formData.category === key ? 700 : 600}
                                  sx={{ textTransform: 'capitalize' }}
                                >
                                  {key}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {desc}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    {aiClassification?.confidence >= 60 && !formData.category && (
                      <Alert severity="info" sx={{ borderRadius: 2, mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Sparkles size={16} />
                          <Typography variant="body2">
                            AI suggests: <strong>{aiClassification.category}</strong> ({aiClassification.confidence}% confidence)
                          </Typography>
                        </Stack>
                      </Alert>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Priority Selection */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Priority Level
                  </Typography>
                  <Stack spacing={1.5}>
                    <Grid container spacing={1}>
                      {['minor', 'medium', 'urgent', 'emergency'].map((priority) => {
                        const priorityConfig = {
                          minor: { label: 'Minor', color: 'info', description: 'Low impact issue' },
                          medium: { label: 'Medium', color: 'warning', description: 'Moderate impact' },
                          urgent: { label: 'Urgent', color: 'error', description: 'Requires quick response' },
                          emergency: {
                            label: 'Emergency',
                            color: 'error',
                            description: 'Immediate action needed',
                          },
                        };
                        const config = priorityConfig[priority];

                        return (
                          <Grid item xs={12} sm={6} key={priority}>
                            <Box
                              onClick={() => setFormData({ ...formData, priority })}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: `2px solid ${
                                  formData.priority === priority
                                    ? theme.palette[config.color]?.main
                                    : theme.palette.divider
                                }`,
                                backgroundColor:
                                  formData.priority === priority
                                    ? alpha(theme.palette[config.color]?.main, 0.08)
                                    : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: theme.palette[config.color]?.main,
                                  backgroundColor: alpha(theme.palette[config.color]?.main, 0.05),
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette[config.color]?.main,
                                    flexShrink: 0,
                                    mt: 0.5,
                                  }}
                                />
                                <Stack spacing={0.5} flex={1}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={formData.priority === priority ? 700 : 600}
                                  >
                                    {config.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {config.description}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                    {aiPriority && (
                      <Alert severity="info" sx={{ borderRadius: 2, mt: 1 }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TrendingUp size={16} />
                            <Typography variant="body2">
                              <strong>AI Priority Score: {aiPriority.score}/100</strong>
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 4, borderRadius: 1, bgcolor: theme.palette.action.hover, overflow: 'hidden' }}>
                            <Box
                              sx={{
                                height: '100%',
                                width: `${aiPriority.score}%`,
                                bgcolor: aiPriority.score >= 70 ? theme.palette.error.main : theme.palette.warning.main,
                                transition: 'width 0.3s',
                              }}
                            />
                          </Box>
                        </Stack>
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Incident Details Card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Incident Details
                </Typography>

                <TextField
                  label="Incident Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  fullWidth
                  placeholder="Brief summary of the incident"
                />

                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Provide detailed information about what happened..."
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Location Selection Card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Location
                </Typography>

                <TextField
                  fullWidth
                  label="Incident Location (Street Address, Barangay, etc.)"
                  placeholder="e.g., Poblacion, Toledo City, Cebu"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Response Needed Card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  What Response Do You Need?
                </Typography>

                <FormLabel component="legend" sx={{ fontWeight: 500 }}>
                  Type of Response Needed
                </FormLabel>
                <RadioGroup
                  value={formData.requestedAction}
                  onChange={(e) => setFormData({ ...formData, requestedAction: e.target.value })}
                >
                  <FormControlLabel value="immediate" control={<Radio />} label="Immediate assistance needed" />
                  <FormControlLabel value="investigation" control={<Radio />} label="Investigation required" />
                  <FormControlLabel value="patrol" control={<Radio />} label="Preventive patrol" />
                  <FormControlLabel value="documentation" control={<Radio />} label="Documentation only" />
                </RadioGroup>

                {formData.requestedAction === 'immediate' && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    This incident will be marked as high priority for immediate response.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Evidence Card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Evidence / Photos (Optional)
                </Typography>

                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <Upload size={32} color={theme.palette.text.secondary} style={{ marginBottom: 8 }} />
                  <Typography variant="body2" color="text.secondary">
                    Drag & drop photos or videos here, or click to select
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                    Max 5 files (images or videos)
                  </Typography>
                </Box>

                {acceptedFiles.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      {acceptedFiles.length} file(s) selected:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {acceptedFiles.map((file, idx) => (
                        <Chip
                          key={idx}
                          icon={file.type.startsWith('image/') ? <ImageIcon size={16} /> : <Upload size={16} />}
                          label={`${file.name.substring(0, 15)}...`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Related Incidents */}
          {relatedIncidents.length > 0 && (
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertCircle size={18} />
                    Similar Recent Incidents
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Are any of these incidents related to what you're reporting?
                  </Typography>

                  <Stack spacing={1}>
                    {relatedIncidents.map((incident) => (
                      <Box
                        key={incident.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                        }}
                        onClick={() => navigate(`/incidents/${incident.id}`)}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {incident.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(incident.createdAt?.toDate?.() || new Date(incident.createdAt), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </Box>
                          <Chip
                            label={incident.status}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {showAiInsights && aiClassification && aiPriority && (
            <Alert
              severity="info"
              icon={<Sparkles size={20} />}
              sx={{
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>AI Analysis</AlertTitle>
              <Stack spacing={1} variant="body2">
                <Typography variant="body2">
                  <strong>Category:</strong> {aiClassification.category} ({aiClassification.confidence}% confidence)
                </Typography>
                <Typography variant="body2">
                  <strong>Priority Score:</strong> {aiPriority.score}/100 → {aiPriority.priority}
                </Typography>
              </Stack>
            </Alert>
          )}

          {/* Submit Button */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/incidents')}
              disabled={createIncident.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={createIncident.isPending ? <CircularProgress size={18} /> : <Sparkles size={18} />}
              disabled={createIncident.isPending}
            >
              {createIncident.isPending ? 'Submitting…' : 'Review & Submit'}
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* AI Response Suggestions */}
      {showAiInsights && aiSuggestions.length > 0 && (
        <ResponseSuggestions suggestions={aiSuggestions} />
      )}

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onClose={() => !createIncident.isPending && setVerificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlertCircle size={20} />
            <span>Review Your Report</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Reporter
              </Typography>
              <Typography variant="body2">
                {formData.anonymous ? 'Anonymous' : reporterName} {reporterContact && !formData.anonymous ? `(${reporterContact})` : ''}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Incident
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {formData.title}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {formData.category}
              </Typography>
              <Typography variant="body2">
                <strong>Priority:</strong> {formData.priority}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {formData.location}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Details
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {formData.description}
              </Typography>
            </Box>

            <Divider />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                By submitting this report, you confirm that the information is accurate and truthful.
                False reports may result in account warnings or suspension.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setVerificationDialogOpen(false)}
            disabled={createIncident.isPending}
          >
            Edit
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            disabled={createIncident.isPending}
            startIcon={createIncident.isPending ? <Loader size={18} /> : <Sparkles size={18} />}
          >
            {createIncident.isPending ? 'Submitting…' : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default IncidentCreate;
