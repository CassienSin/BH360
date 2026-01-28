import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Rating,
  Box,
  IconButton,
  alpha,
} from '@mui/material';
import { X, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const FeedbackDialog = ({ open, onClose, onSubmit, type = 'ticket', itemTitle = '' }) => {
  const [ratings, setRatings] = useState({
    overallRating: 0,
    responseTime: 0,
    helpfulness: 0,
    professionalism: 0,
  });
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // Validate
    if (ratings.overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    const feedbackData = {
      id: `feedback-${Date.now()}`,
      ...ratings,
      comment: comment.trim(),
      submittedAt: new Date(),
    };

    onSubmit(feedbackData);
    toast.success('Thank you for your feedback!');

    // Reset form
    setRatings({
      overallRating: 0,
      responseTime: 0,
      helpfulness: 0,
      professionalism: 0,
    });
    setComment('');
  };

  const handleClose = () => {
    // Reset form on close
    setRatings({
      overallRating: 0,
      responseTime: 0,
      helpfulness: 0,
      professionalism: 0,
    });
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
              }}
            >
              <Star size={24} color="#f59e0b" />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Rate Your Experience
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {itemTitle && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.05),
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {itemTitle}
              </Typography>
            </Box>
          )}

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Overall Rating *
              </Typography>
              <Rating
                name="overall-rating"
                value={ratings.overallRating}
                onChange={(_, newValue) =>
                  setRatings({ ...ratings, overallRating: newValue || 0 })
                }
                size="large"
                precision={0.5}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Response Time
              </Typography>
              <Rating
                name="response-time"
                value={ratings.responseTime}
                onChange={(_, newValue) =>
                  setRatings({ ...ratings, responseTime: newValue || 0 })
                }
                size="medium"
                precision={0.5}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Helpfulness
              </Typography>
              <Rating
                name="helpfulness"
                value={ratings.helpfulness}
                onChange={(_, newValue) =>
                  setRatings({ ...ratings, helpfulness: newValue || 0 })
                }
                size="medium"
                precision={0.5}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Professionalism
              </Typography>
              <Rating
                name="professionalism"
                value={ratings.professionalism}
                onChange={(_, newValue) =>
                  setRatings({ ...ratings, professionalism: newValue || 0 })
                }
                size="medium"
                precision={0.5}
              />
            </Box>

            <TextField
              label="Additional Comments (Optional)"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={ratings.overallRating === 0}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
