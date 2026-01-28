import {
  Card,
  CardContent,
  Stack,
  Typography,
  Rating,
  Box,
  Divider,
  alpha,
} from '@mui/material';
import { Star, User } from 'lucide-react';
import { format } from 'date-fns';

const FeedbackCard = ({ feedback }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.03),
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <User size={16} color="#6366f1" />
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {feedback.userName || 'Anonymous'}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(feedback.submittedAt), 'MMM dd, yyyy')}
            </Typography>
          </Stack>

          <Divider />

          {/* Ratings */}
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                Overall Rating
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating value={feedback.overallRating} readOnly size="small" precision={0.5} />
                <Typography variant="body2" fontWeight={600}>
                  {feedback.overallRating.toFixed(1)}
                </Typography>
              </Stack>
            </Stack>

            {feedback.responseTime > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Response Time
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Rating value={feedback.responseTime} readOnly size="small" precision={0.5} />
                  <Typography variant="caption" color="text.secondary">
                    {feedback.responseTime.toFixed(1)}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {feedback.helpfulness > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Helpfulness
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Rating value={feedback.helpfulness} readOnly size="small" precision={0.5} />
                  <Typography variant="caption" color="text.secondary">
                    {feedback.helpfulness.toFixed(1)}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {feedback.professionalism > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Professionalism
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Rating value={feedback.professionalism} readOnly size="small" precision={0.5} />
                  <Typography variant="caption" color="text.secondary">
                    {feedback.professionalism.toFixed(1)}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>

          {/* Comment */}
          {feedback.comment && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                  Comment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  "{feedback.comment}"
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
