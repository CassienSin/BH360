import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { ArrowLeft, Upload, Sparkles, TrendingUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { classifyIncident, calculatePriorityScore, suggestResponseActions } from '../../services/aiService';
import ResponseSuggestions from '../../components/ai/ResponseSuggestions';
import { useCreateIncident } from '../../hooks/useIncidents';
import { useAppSelector } from '../../store/hooks';

const IncidentCreate = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const createIncident = useCreateIncident();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
    reporterName: '',
    reporterContact: '',
  });
  const [aiClassification, setAiClassification] = useState(null);
  const [aiPriority, setAiPriority] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiInsights, setShowAiInsights] = useState(false);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'video/*': ['.mp4', '.mov'],
    },
    maxFiles: 5,
  });

  // AI Classification when title and description change
  useEffect(() => {
    if (formData.title.length > 5 && formData.description.length > 10) {
      const classification = classifyIncident(formData.title, formData.description);
      setAiClassification(classification);

      // Auto-suggest category if confidence is high
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

      // Auto-suggest priority if not set
      if (!formData.priority) {
        setFormData(prev => ({ ...prev, priority: priorityResult.priority }));
      }

      // Generate response suggestions
      const suggestions = suggestResponseActions({
        ...incidentData,
        priority: priorityResult.priority
      });
      setAiSuggestions(suggestions);
      setShowAiInsights(true);
    }
  }, [formData.title, formData.description, formData.category, formData.location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare incident data for Firebase
      const incidentData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority || aiPriority?.priority || 'medium',
        location: formData.location,
        reporterName: formData.reporterName || user?.displayName || 'Anonymous',
        reporterContact: formData.reporterContact || user?.email || '',
        userId: user?.uid || null,
        status: 'submitted',
        // Include AI analysis data
        aiAnalysis: {
          classification: aiClassification,
          priorityScore: aiPriority,
          suggestions: aiSuggestions,
        },
      };
      
      // Save to Firebase
      await createIncident.mutateAsync(incidentData);
      
      // Success toast is automatically shown by the hook
      navigate('/incidents');
    } catch (error) {
      console.error('Error creating incident:', error);
      // Error toast is automatically shown by the hook
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/incidents')}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Report New Incident
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent>
            <Stack spacing={3}>
              <TextField
                label="Incident Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
                placeholder="Brief summary of the incident"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  label="Your Name"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  fullWidth
                  placeholder={user?.displayName || 'Your name'}
                />

                <TextField
                  label="Contact Number"
                  value={formData.reporterContact}
                  onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                  fullWidth
                  placeholder={user?.email || 'Your contact info'}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  fullWidth
                  helperText={
                    aiClassification && aiClassification.confidence >= 60 ? (
                      <Stack direction="row" spacing={0.5} alignItems="center" component="span">
                        <Sparkles size={12} />
                        <span>AI Suggestion: {aiClassification.category} ({aiClassification.confidence}% confidence)</span>
                      </Stack>
                    ) : null
                  }
                >
                  <MenuItem value="crime">Crime</MenuItem>
                  <MenuItem value="noise">Noise</MenuItem>
                  <MenuItem value="fire">Fire</MenuItem>
                  <MenuItem value="dispute">Dispute</MenuItem>
                  <MenuItem value="hazard">Hazard</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="utility">Utility</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                  fullWidth
                  helperText={
                    aiPriority ? (
                      <Stack direction="row" spacing={0.5} alignItems="center" component="span">
                        <TrendingUp size={12} />
                        <span>AI Score: {aiPriority.score}/100 - Suggested: {aiPriority.priority}</span>
                      </Stack>
                    ) : null
                  }
                >
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </TextField>
              </Stack>

              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                fullWidth
                placeholder="e.g., Purok 3, Barangay Hall Area"
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                fullWidth
                multiline
                rows={4}
                placeholder="Provide detailed information about the incident..."
              />

              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Upload Photos/Videos (Optional)
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
                    Drag & drop files here, or click to select
                  </Typography>
                  {acceptedFiles.length > 0 && (
                    <Typography variant="caption" color="primary.main" mt={1}>
                      {acceptedFiles.length} file(s) selected
                    </Typography>
                  )}
                </Box>
              </Box>

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
                  <AlertTitle sx={{ fontWeight: 700 }}>AI Analysis Complete</AlertTitle>
                  <Typography variant="body2" mb={1}>
                    Classification: <strong>{aiClassification.category}</strong> ({aiClassification.confidence}% confidence) | 
                    Priority Score: <strong>{aiPriority.score}/100</strong>
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {aiClassification.alternativeCategories && aiClassification.alternativeCategories.map(cat => (
                      <Chip
                        key={cat.category}
                        label={`${cat.category} (${cat.confidence}%)`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    ))}
                  </Stack>
                </Alert>
              )}

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
                  {createIncident.isPending ? 'Submitting...' : 'Submit Report with AI Analysis'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </form>

      {/* AI Response Suggestions */}
      {showAiInsights && aiSuggestions.length > 0 && (
        <ResponseSuggestions suggestions={aiSuggestions} />
      )}
    </Stack>
  );
};

export default IncidentCreate;

