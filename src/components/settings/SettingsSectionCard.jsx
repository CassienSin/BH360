import { Paper, Box, Typography, Stack, Button } from '@mui/material';

/**
 * SettingsSectionCard
 *
 * Reusable wrapper for a settings section.
 * When preview=true the card is dimmed and shows a "Switch to tab" button.
 */
const SettingsSectionCard = ({
  title,
  description,
  children,
  action,
  preview = false,
  onSwitchTab,
}) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: '12px',
      overflow: 'hidden',
      opacity: preview ? 0.5 : 1,
      transition: 'opacity 0.2s ease',
      bgcolor: 'background.paper',
    }}
  >
    {/* ── Section header ── */}
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

      {preview ? (
        <Button
          variant="outlined"
          size="small"
          onClick={onSwitchTab}
          sx={{
            pointerEvents: 'auto',
            flexShrink: 0,
            fontSize: '0.75rem',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          Switch to tab ›
        </Button>
      ) : (
        action
      )}
    </Stack>

    {/* ── Section body ── */}
    <Box sx={{ p: 2.5, pointerEvents: preview ? 'none' : 'auto' }}>
      {children}
    </Box>
  </Paper>
);

export default SettingsSectionCard;
