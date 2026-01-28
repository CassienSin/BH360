import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  alpha,
  useTheme,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { X, FileText, Clock, DollarSign, Calendar, CheckCircle, ChevronDown, AlertCircle, Target } from 'lucide-react';

const ServiceDetailsDialog = ({ open, onClose, service }) => {
  const theme = useTheme();

  if (!service) return null;

  const getCategoryColor = (category) => {
    const colors = {
      Certificates: theme.palette.primary.main,
      Permits: theme.palette.secondary.main,
      IDs: theme.palette.info.main,
    };
    return colors[category] || theme.palette.grey[500];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="start" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
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
            <Stack>
              <Typography variant="h5" fontWeight={700}>
                {service.name}
              </Typography>
              <Chip
                label={service.category}
                size="small"
                sx={{
                  backgroundColor: alpha(getCategoryColor(service.category), 0.1),
                  color: getCategoryColor(service.category),
                  fontWeight: 600,
                  mt: 0.5,
                  width: 'fit-content',
                }}
              />
            </Stack>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Description */}
          <Typography variant="body1" color="text.secondary">
            {service.description}
          </Typography>

          <Divider />

          {/* Quick Info Grid */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Clock size={16} color={theme.palette.info.main} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Processing Time
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700}>
                  {service.processingTime}
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DollarSign size={16} color={theme.palette.success.main} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Fee
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700} color={service.fee === 'FREE' ? 'success.main' : 'text.primary'}>
                  {service.fee}
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={16} color={theme.palette.warning.main} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Valid For
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700}>
                  {service.validFor}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Divider />

          {/* Requirements */}
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircle size={20} color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={700}>
                Requirements
              </Typography>
            </Stack>
            <List sx={{ py: 0 }}>
              {service.requirements.map((req, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.primary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={req}
                    primaryTypographyProps={{
                      variant: 'body2',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>

          <Divider />

          {/* Procedures */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Target size={20} color={theme.palette.secondary.main} />
                <Typography variant="h6" fontWeight={700}>
                  Step-by-Step Procedures
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ py: 0 }}>
                {service.procedures.map((procedure, index) => (
                  <ListItem key={index} sx={{ py: 1, px: 0, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {index + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={procedure}
                      primaryTypographyProps={{
                        variant: 'body2',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Purposes */}
          {service.purposes && service.purposes.length > 0 && (
            <>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Common Purposes
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {service.purposes.map((purpose, index) => (
                    <Chip
                      key={index}
                      label={purpose}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: alpha(theme.palette.text.secondary, 0.2),
                        mb: 1,
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </>
          )}

          {/* Notes */}
          {service.notes && service.notes.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AlertCircle size={18} color={theme.palette.warning.main} />
                  <Typography variant="subtitle2" fontWeight={700} color="warning.main">
                    Important Notes
                  </Typography>
                </Stack>
                {service.notes.map((note, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {note}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button variant="contained">
          Start Application
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDetailsDialog;
