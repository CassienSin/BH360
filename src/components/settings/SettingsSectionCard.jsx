import { Paper, Box, Typography, Stack } from '@mui/material';

/**
 * SettingsSectionCard
 * Reusable wrapper for a settings section.
 */
const SettingsSectionCard = ({ title, description, children, action }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: '12px',
      overflow: 'hidden',
      bgcolor: 'background.paper',
    }}
  >
    {/* Section header */}
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      sx={{
        px: 2.5,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'grey.50',
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.25 }}
          >
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>

    {/* Section body */}
    <Box sx={{ p: 2.5 }}>
      {children}
    </Box>
  </Paper>
);

export default SettingsSectionCard;
