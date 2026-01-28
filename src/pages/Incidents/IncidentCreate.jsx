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
} from '@mui/material';
import { ArrowLeft, Upload, Sparkles, TrendingUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { classifyIncident, calculatePriorityScore, suggestResponseActions } from '../../services/aiService';
import ResponseSuggestions from '../../components/ai/ResponseSuggestions';

const IncidentCreate = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Include AI data in submission
    const submissionData = {
      ...formData,
      aiClassification,
      aiPriority,
      aiSuggestions,
    createdAt: new Date().toISOString()
    };
    
    toast.success('Incident reported successfully with AI analysis!');
    navigate('/incidents');
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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Incident Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
                  <MenuItem value="dispute">Dispute</MenuItem>
                  <MenuItem value="hazard">Hazard</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="utility">Utility</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  fullWidth
                  placeholder="e.g., Purok 3, Barangay Hall Area"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
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
              </Grid>

              <Grid size={{ xs: 12 }}>
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
              </Grid>

              {showAiInsights && aiClassification && aiPriority && (
                <Grid size={{ xs: 12 }}>
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
                      {aiClassification.suggestedCategories.map(cat => (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        />
                      ))}
                    </Stack>
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/incidents')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" startIcon={<Sparkles size={18} />}>
                    Submit Report with AI Analysis
                  </Button>
                </Stack>
              </Grid>
            </Grid>
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

