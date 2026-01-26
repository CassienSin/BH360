import { useState } from 'react';
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
} from '@mui/material';
import { ArrowLeft, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

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

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'video/*': ['.mp4', '.mov'],
    },
    maxFiles: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Incident reported successfully!');
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
                >
                  <MenuItem value="crime">Crime</MenuItem>
                  <MenuItem value="noise">Noise</MenuItem>
                  <MenuItem value="dispute">Dispute</MenuItem>
                  <MenuItem value="hazard">Hazard</MenuItem>
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

              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/incidents')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Submit Report
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>
    </Stack>
  );
};

export default IncidentCreate;
