import { Box, Stack, Typography } from '@mui/material';
import NetworkIcon from './NetworkIcon';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'light' | 'green';
}

const Logo = ({ size = 'medium', showText = true, variant = 'default' }: LogoProps) => {
  const dimensions = {
    small: { container: 36, icon: 18, text: 'h6' as const },
    medium: { container: 48, icon: 26, text: 'h5' as const },
    large: { container: 64, icon: 34, text: 'h4' as const },
  };

  const config = dimensions[size];
  
  // Color schemes based on variant
  const colorScheme = {
    default: {
      background: 'linear-gradient(135deg, #3457D5 0%, #5B8DEE 50%, #7BA4F5 100%)',
      textGradient: 'linear-gradient(135deg, #3457D5 0%, #5B8DEE 100%)',
      iconColor: '#FFFFFF',
      shadow: '0 8px 24px rgba(52, 87, 213, 0.35), 0 2px 8px rgba(52, 87, 213, 0.2)',
      hoverShadow: '0 12px 32px rgba(52, 87, 213, 0.4), 0 4px 12px rgba(52, 87, 213, 0.25)',
    },
    light: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      textGradient: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
      iconColor: '#3457D5',
      shadow: '0 4px 20px rgba(52, 87, 213, 0.15), inset 0 1px 2px rgba(255,255,255,0.8)',
      hoverShadow: '0 6px 24px rgba(52, 87, 213, 0.2), inset 0 1px 2px rgba(255,255,255,0.8)',
    },
    green: {
      background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
      textGradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      iconColor: '#FFFFFF',
      shadow: '0 8px 24px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(16, 185, 129, 0.2)',
      hoverShadow: '0 12px 32px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(16, 185, 129, 0.25)',
    },
  };
  
  const colors = colorScheme[variant];

  return (
    <Stack direction="row" spacing={showText ? 2 : 0} alignItems="center">
      {/* Logo Icon - Network/Hub Structure */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.container,
          height: config.container,
          borderRadius: '14px',
          background: colors.background,
          boxShadow: colors.shadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: colors.hoverShadow,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            padding: '2px',
            background:
              variant === 'light'
                ? 'linear-gradient(135deg, #3457D5 0%, #5B8DEE 100%)'
                : variant === 'green'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: variant === 'light' ? 0.3 : 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '4px',
            left: '6px',
            right: '6px',
            height: '35%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '10px 10px 50% 50%',
            opacity: variant === 'light' ? 0.6 : 1,
          },
        }}
      >
        {/* Network Icon */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <NetworkIcon size={config.icon} color={colors.iconColor} variant={variant === 'light' ? 'primary' : 'white'} />
        </Box>
      </Box>

      {/* Text */}
      {showText && (
        <Stack spacing={0}>
          <Typography
            variant={config.text}
            sx={{
              fontWeight: 800,
              background: colors.textGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.04em',
              lineHeight: 1.2,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            BH360
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: variant === 'light' ? 'rgba(30, 41, 59, 0.7)' : variant === 'green' ? 'rgba(5, 150, 105, 0.9)' : 'text.secondary',
              fontSize: size === 'small' ? '0.65rem' : size === 'medium' ? '0.75rem' : '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            Barangay Management System
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default Logo;
