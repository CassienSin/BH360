import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899',
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#ED6C02',
      light: '#FF9800',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
      dark: '#01579B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: 'rgba(255, 255, 255, 0.8)',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02857em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(15, 23, 42, 0.05)',
    '0px 4px 8px rgba(15, 23, 42, 0.08)',
    '0px 8px 16px rgba(15, 23, 42, 0.10)',
    '0px 12px 24px rgba(15, 23, 42, 0.12)',
    '0px 16px 32px rgba(15, 23, 42, 0.14)',
    '0px 20px 40px rgba(15, 23, 42, 0.16)',
    '0px 24px 48px rgba(15, 23, 42, 0.18)',
    '0px 28px 56px rgba(15, 23, 42, 0.20)',
    '0px 32px 64px rgba(15, 23, 42, 0.22)',
    '0px 36px 72px rgba(15, 23, 42, 0.24)',
    '0px 40px 80px rgba(15, 23, 42, 0.26)',
    '0px 44px 88px rgba(15, 23, 42, 0.28)',
    '0px 48px 96px rgba(15, 23, 42, 0.30)',
    '0px 52px 104px rgba(15, 23, 42, 0.32)',
    '0px 56px 112px rgba(15, 23, 42, 0.34)',
    '0px 60px 120px rgba(15, 23, 42, 0.36)',
    '0px 64px 128px rgba(15, 23, 42, 0.38)',
    '0px 68px 136px rgba(15, 23, 42, 0.40)',
    '0px 72px 144px rgba(15, 23, 42, 0.42)',
    '0px 76px 152px rgba(15, 23, 42, 0.44)',
    '0px 80px 160px rgba(15, 23, 42, 0.46)',
    '0px 84px 168px rgba(15, 23, 42, 0.48)',
    '0px 88px 176px rgba(15, 23, 42, 0.50)',
    '0px 92px 184px rgba(15, 23, 42, 0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(99, 102, 241, 0.25)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 16px rgba(99, 102, 241, 0.25)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
