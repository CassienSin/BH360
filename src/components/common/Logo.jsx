import { Box, Stack, Typography } from '@mui/material';
import BHLogo from '../../assets/BH_Logo.png';

/**
 * Logo
 *
 * Props:
 *  size     — 'small' | 'medium' | 'large'
 *  showText — boolean
 *  variant  — 'default' (on dark/gradient bg) | 'light' (on white/light bg)
 *  src      — optional override image URL
 *  text     — { title, subtitle }
 */
const Logo = ({
  size = 'medium',
  showText = true,
  variant = 'default',
  src,
  text = { title: 'BH360', subtitle: 'Barangay Mgt.' },
}) => {
  const dimensions = {
    small:  { imgSize: 34, titleVariant: 'h6',  subtextSize: '0.6rem',  spacing: 1 },
    medium: { imgSize: 44, titleVariant: 'h5',  subtextSize: '0.68rem', spacing: 1.25 },
    large:  { imgSize: 60, titleVariant: 'h4',  subtextSize: '0.75rem', spacing: 1.5 },
  };

  const cfg = dimensions[size] ?? dimensions.medium;
  const logoSrc = src || BHLogo;

  // Text colours per variant
  const titleGradient =
    variant === 'light'
      ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
      : 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.88) 100%)';

  const subtitleColor =
    variant === 'light' ? '#64748B' : 'rgba(255,255,255,0.72)';

  // Drop-shadow depth per variant
  const imgFilter =
    variant === 'light'
      ? 'drop-shadow(0 3px 10px rgba(99,102,241,0.22))'
      : 'drop-shadow(0 4px 14px rgba(0,0,0,0.28))';

  const imgHoverFilter =
    variant === 'light'
      ? 'drop-shadow(0 6px 18px rgba(99,102,241,0.32))'
      : 'drop-shadow(0 8px 24px rgba(0,0,0,0.38))';

  return (
    <Stack
      direction="row"
      spacing={showText ? cfg.spacing : 0}
      alignItems="center"
      sx={{ userSelect: 'none' }}
    >
      {/* ── Logo image ─────────────────────────────────── */}
      {/* The PNG is self-contained (squircle + teal bg + white B).  
          No extra container box needed — just size + animation. */}
      <Box
        sx={{
          width: cfg.imgSize,
          height: cfg.imgSize,
          flexShrink: 0,
          lineHeight: 0, // removes phantom inline gap
          filter: imgFilter,
          transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.28s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-3px) scale(1.06)',
            filter: imgHoverFilter,
          },
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt="BH360 logo"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>

      {/* ── Text group ─────────────────────────────────── */}
      {showText && (
        <Stack spacing={-0.4}>
          <Typography
            variant={cfg.titleVariant}
            sx={{
              fontWeight: 800,
              background: titleGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            {text.title}
          </Typography>
          <Typography
            sx={{
              color: subtitleColor,
              fontSize: cfg.subtextSize,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              lineHeight: 1.4,
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
