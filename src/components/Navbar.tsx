
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, 
         Drawer, List, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function Navbar() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <HomeIcon /> },
    { label: 'Jobs', path: '/jobs', icon: <WorkIcon /> },
    { label: 'Logs', path: '/logs', icon: <ListAltIcon /> },
    { label: 'Users', path: '/users', icon: <PeopleIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {navItems.map((item) => (
          <ListItemButton
            component={Link}
            to={item.path}
            key={item.label}
            selected={isActive(item.path)}
            onClick={() => toggleDrawer(false)}
            sx={{
              backgroundColor: isActive(item.path) ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <ListItemButton
          onClick={handleLogout}
        >
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Corntab
        </Typography>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', mr: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                color={isActive(item.path) ? "primary" : "inherit"}
                sx={{ 
                  mx: 1,
                  fontWeight: isActive(item.path) ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ThemeSwitcher />
          {!isMobile && (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
