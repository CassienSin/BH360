import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const DRAWER_WIDTH = 280;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid rgba(255, 255, 255, 0.3)`,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <Sidebar onClose={() => {}} />
        </Drawer>
      )}

      {/* Sidebar - Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 50%, #FECDD3 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <Header onMenuClick={handleDrawerToggle} />
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
