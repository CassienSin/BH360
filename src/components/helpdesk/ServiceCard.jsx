import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  alpha,
  useTheme,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { FileText, Clock, DollarSign, CheckCircle, ChevronRight, Calendar } from 'lucide-react';

const ServiceCard = ({ service, onViewDetails }) => {
  const theme = useTheme();

  const getCategoryColor = (category) => {
    const colors = {
      Certificates: theme.palette.primary.main,
      Permits: theme.palette.secondary.main,
      IDs: theme.palette.info.main,
    };
    return colors[category] || theme.palette.grey[500];
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: getCategoryColor(service.category),
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(getCategoryColor(service.category), 0.15)}`,
        },
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(getCategoryColor(service.category), 0.1),
                color: getCategoryColor(service.category),
              }}
            >
              <FileText size={24} />
            </Box>
            <Chip
              label={service.category}
              size="small"
              sx={{
                backgroundColor: alpha(getCategoryColor(service.category), 0.1),
                color: getCategoryColor(service.category),
                fontWeight: 600,
              }}
            />
          </Stack>

          {/* Title and Description */}
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              {service.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
              {service.description}
            </Typography>
          </Stack>

          <Divider />

          {/* Quick Info */}
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Clock size={16} color={theme.palette.text.secondary} />
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Processing Time
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {service.processingTime}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <DollarSign size={16} color={theme.palette.text.secondary} />
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Fee
                </Typography>
                <Typography variant="body2" fontWeight={600} color={service.fee === 'FREE' ? 'success.main' : 'text.primary'}>
                  {service.fee}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Calendar size={16} color={theme.palette.text.secondary} />
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Valid For
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {service.validFor}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* View Details Button */}
          <Button
            variant="outlined"
            fullWidth
            endIcon={<ChevronRight size={18} />}
            onClick={() => onViewDetails(service)}
            sx={{
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: getCategoryColor(service.category),
                backgroundColor: alpha(getCategoryColor(service.category), 0.05),
              },
            }}
          >
            View Details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
