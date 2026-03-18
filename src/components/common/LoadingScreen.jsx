import { Box, Typography } from '@mui/material';
import BHLogo from '../../assets/BH_Logo.png';
import styles from './LoadingScreen.module.scss';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <Box className={styles.root}>
      {/* Decorative background orbs */}
      <Box className={styles.orb1} />
      <Box className={styles.orb2} />
      <Box className={styles.orb3} />

      <Box className={styles.content}>
        {/* Logo with float animation */}
        <Box className={styles.logoWrapper}>
          <Box
            component="img"
            src={BHLogo}
            alt="BH360 logo"
            className={styles.logo}
          />
          <Box className={styles.logoGlow} />
        </Box>

        {/* App name */}
        <Typography className={styles.title} variant="h4">
          BH360
        </Typography>
        <Typography className={styles.subtitle}>
          Barangay Management System
        </Typography>

        {/* Animated dots loader */}
        <Box className={styles.dotsWrapper}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </Box>

        {/* Message */}
        <Typography className={styles.message}>{message}</Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
