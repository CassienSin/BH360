import { Stack, Card, CardContent, Typography, Box, Chip, alpha, useTheme, Divider } from '@mui/material';
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';

const ResponseSuggestions = ({ suggestions = [] }) => {
  const theme = useTheme();

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const urgentActions = suggestions.filter(s => s.urgent);
  const normalActions = suggestions.filter(s => !s.urgent);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Zap size={20} color={theme.palette.warning.main} />
            <Typography variant="h6" fontWeight={600}>
              Suggested Response Actions
            </Typography>
            <Chip
              label="AI Generated"
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Stack>

          {urgentActions.length > 0 && (
            <>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <AlertCircle size={18} color={theme.palette.error.main} />
                  <Typography variant="subtitle2" fontWeight={700} color="error.main">
                    URGENT ACTIONS
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {urgentActions.map((action, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.error.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {action.priority}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {action.action}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
              {normalActions.length > 0 && <Divider />}
            </>
          )}

          {normalActions.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Clock size={18} color={theme.palette.info.main} />
                <Typography variant="subtitle2" fontWeight={700} color="info.main">
                  FOLLOW-UP ACTIONS
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {normalActions.map((action, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.grey[500], 0.05),
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.grey[300],
                        color: theme.palette.grey[700],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {action.priority}
                    </Box>
                    <Typography variant="body2">
                      {action.action}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.08),
              border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircle size={16} color={theme.palette.success.main} />
              <Typography variant="caption" color="text.secondary">
                These actions are AI-generated suggestions. Use your judgment and follow barangay protocols.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResponseSuggestions;
