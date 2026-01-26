import { Box } from '@mui/material';

interface NetworkIconProps {
  size?: number;
  color?: string;
  variant?: 'primary' | 'white';
}

const NetworkIcon = ({ size = 32, color, variant = 'primary' }: NetworkIconProps) => {
  const iconColor = color || (variant === 'white' ? '#FFFFFF' : '#3457D5');
  
  return (
    <Box
      component="svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={{
        display: 'block',
      }}
    >
      {/* Center circle */}
      <circle cx="50" cy="50" r="8" fill={iconColor} />
      
      {/* Top node */}
      <circle cx="50" cy="15" r="8" fill={iconColor} />
      <line x1="50" y1="23" x2="50" y2="42" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
      
      {/* Top-right node */}
      <circle cx="80" cy="30" r="8" fill={iconColor} />
      <line x1="73" y1="35" x2="57" y2="47" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
      
      {/* Bottom-right node */}
      <circle cx="80" cy="70" r="8" fill={iconColor} />
      <line x1="73" y1="65" x2="57" y2="53" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
      
      {/* Bottom node */}
      <circle cx="50" cy="85" r="8" fill={iconColor} />
      <line x1="50" y1="77" x2="50" y2="58" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
      
      {/* Bottom-left node */}
      <circle cx="20" cy="70" r="8" fill={iconColor} />
      <line x1="27" y1="65" x2="43" y2="53" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
      
      {/* Top-left node */}
      <circle cx="20" cy="30" r="8" fill={iconColor} />
      <line x1="27" y1="35" x2="43" y2="47" stroke={iconColor} strokeWidth="6" strokeLinecap="round" />
    </Box>
  );
};

export default NetworkIcon;
