import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

// 1. The Default Fallback Icon (The original "B")
const DefaultIcon = ({ size, color, opacity = 1 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <path
      d="M6 5C6 3.89543 6.89543 3 8 3H12C14.7614 3 17 5.23858 17 8C17 10.7614 14.7614 13 12 13H8V9H12C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7H9C8.44772 7 8 7.44772 8 8V13H6V5Z"
      fill={color}
      fillOpacity={opacity}
    />
    <path
      d="M6 15V20C6 21.1046 6.89543 22 8 22H13C16.3137 22 19 19.3137 19 16C19 12.6863 16.3137 10 13 10H8V15H6ZM8 15H13C13.5523 15 14 15.4477 14 16C14 16.5523 13.5523 17 13 17H9C8.44772 17 8 16.5523 8 16V15Z"
      fill={color}
      fillOpacity={opacity}
    />
  </svg>
);

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  variant = 'default',
  // New Prop: Image Source (URL or import)
  src = "", 
  // New Prop: Custom Text
  text = { title: 'BH360', subtitle: 'BMS' } 
}) => {
  
  const dimensions = {
    small: { container: 36, icon: 20, text: 'h6', subtext: '0.65rem' },
    medium: { container: 48, icon: 28, text: 'h5', subtext: '0.75rem' },
    large: { container: 64, icon: 38, text: 'h4', subtext: '0.85rem' },
  };

  const config = dimensions[size];

  // Color schemes
  const colorScheme = {
    default: {
      background: '#FFFFFF',
      textGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%)',
      iconColor: '#4F46E5',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      hoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      ringColor: 'rgba(79, 70, 229, 0.1)',
    },
    light: {
      background: '#FFFFFF',
      textGradient: 'linear-gradient(135deg, #4F46E5 0%, #4F46E5 100%)',
      iconColor: '#4F46E5',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      hoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      ringColor: 'rgba(79, 70, 229, 0.1)',
    },

  };

  const colors = colorScheme[variant];

  return (
    <Stack direction="row" spacing={showText ? 1.5 : 0} alignItems="center">
      {/* Logo Icon Container */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.container,
          height: config.container,
          borderRadius: '16px',
          background: colors.background,
          boxShadow: colors.shadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: variant === 'light' ? '1px solid #E2E8F0' : 'none',
          overflow: 'hidden', // Ensures generic images stay inside rounded corners
          
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: colors.hoverShadow,
            '& .logo-shine': {
              transform: 'translateX(100%)',
            }
          },
          
          // Inner Ring for detail
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '3px',
            borderRadius: '13px',
            border: `1.5px solid ${colors.ringColor}`,
            opacity: 0.8,
            zIndex: 2, // Ensure ring sits on top of images
            pointerEvents: 'none',
          },
        }}
      >
        {/* Shine Animation Effect */}
        <Box
          className="logo-shine"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 40%, transparent 60%)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.6s',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />

        {/* LOGO CONTENT LOGIC */}
        <Box 
          sx={{ 
            zIndex: 1, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            filter: src ? 'none' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' 
          }}
        >
          {src ? (
            // 1. If SRC provided, render Image
            <Box
                component="img"
                src={src}
                alt="Logo"
                sx={{
                    width: '65%', // Leaves some padding around the image
                    height: '65%',
                    objectFit: 'contain',
                    // Optional: If you want to force white icons on dark backgrounds
                    // filter: variant !== 'light' ? 'brightness(0) invert(1)' : 'none' 
                }}
            />
          ) : (
            // 2. If NO SRC, render Default Vector B
            <DefaultIcon 
              size={config.icon} 
              color={colors.iconColor} 
              opacity={variant === 'light' ? 1 : 0.95} 
            />
          )}
        </Box>
      </Box>

      {/* Text Group */}
      {showText && (
        <Stack spacing={-0.25} sx={{ userSelect: 'none' }}>
          <Typography
            variant={config.text}
            sx={{
              fontWeight: 800,
              background: colors.textGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.1,
            }}
          >
            {text.title}
          </Typography>
          <Typography
            sx={{
              color: variant === 'light' ? '#4F46E5' : variant === 'green' ? '#10B981' : '#FFFFFF',
              fontSize: config.subtext,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            {text.subtitle}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default Logo;