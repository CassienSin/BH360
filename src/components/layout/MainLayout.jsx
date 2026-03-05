import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const DRAWER_WIDTH = 280;
const RAIL_WIDTH = 72; // collapsed icon-only rail width

// Persist collapse preference across sessions
const readCollapsed = () => {
  try {
    return localStorage.getItem('bh360-sidebar-collapsed') === 'true';
  } catch {
    return false;
  }
};

const writeCollapsed = (value) => {
  try {
    localStorage.setItem('bh360-sidebar-collapsed', String(value));
  } catch {
    // ignore
  }
};

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed);
  const location = useLocation();

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleCollapseToggle = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(next);
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {}, []);

  const drawerWidth = sidebarCollapsed ? RAIL_WIDTH : DRAWER_WIDTH;

  const drawerPaperSx = {
    boxSizing: 'border-box',
    borderRight: `1px solid rgba(255, 255, 255, 0.3)`,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    overflowX: 'hidden',
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: sidebarCollapsed
                ? theme.transitions.duration.leavingScreen
                : theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              ...drawerPaperSx,
              width: drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: sidebarCollapsed
                  ? theme.transitions.duration.leavingScreen
                  : theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Sidebar
            onClose={handleClose}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleCollapseToggle}
          />
        </Drawer>
      )}

      {/* ── Mobile sidebar ── */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              ...drawerPaperSx,
              width: DRAWER_WIDTH,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          }}
        >
          {/* Mobile always shows full sidebar, no collapse */}
          <Sidebar onClose={handleDrawerToggle} collapsed={false} />
        </Drawer>
      )}

      {/* ── Main content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 50%, #FECDD3 100%)',
          backgroundAttachment: 'fixed',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: sidebarCollapsed
              ? theme.transitions.duration.leavingScreen
              : theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Header onMenuClick={handleDrawerToggle} />
        <Box
          key={location.pathname}
          className="animate-fade-in"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: location.pathname.startsWith('/settings') ? 0 : { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
