import { Component } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            p: 4,
          }}
        >
          <Stack alignItems="center" spacing={2} maxWidth={480} textAlign="center">
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: (theme) => `${theme.palette.error.main}18`,
              }}
            >
              <AlertCircle size={48} color="#ef4444" />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              An unexpected error occurred while rendering this section. Try refreshing or click below to retry.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
