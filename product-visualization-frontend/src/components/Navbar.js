import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Badge,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  PhotoLibrary as GalleryIcon,
  AddAPhoto as UploadIcon,
  Subscriptions as SubscriptionIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  NotificationsOutlined as NotificationIcon
} from '@mui/icons-material';

const Navbar = ({ isAuthenticated, logout }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State for user menu
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchor);
  
  // State for notification menu
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const notificationMenuOpen = Boolean(notificationAnchor);
  
  // Handle user menu open
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  // Handle notification menu
  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  // Handle drawer toggle
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    
    setDrawerOpen(open);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/');
  };
  
  // Navigation items for authenticated users
  const navItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      onClick: () => {
        navigate('/dashboard');
        setDrawerOpen(false);
      }
    },
    {
      text: 'Upload Product',
      icon: <UploadIcon />,
      path: '/upload',
      onClick: () => {
        navigate('/upload');
        setDrawerOpen(false);
      }
    },
    {
      text: 'Gallery',
      icon: <GalleryIcon />,
      path: '/gallery',
      onClick: () => {
        navigate('/gallery');
        setDrawerOpen(false);
      }
    },
    {
      text: 'Subscription',
      icon: <SubscriptionIcon />,
      path: '/subscription',
      onClick: () => {
        navigate('/subscription');
        setDrawerOpen(false);
      }
    }
  ];
  
  // Mock notifications - in a real app, these would come from your API
  const notifications = [
    {
      id: 1,
      message: 'Your product visualization is complete',
      time: '5 minutes ago'
    },
    {
      id: 2,
      message: 'New scene templates are available',
      time: '1 hour ago'
    },
    {
      id: 3,
      message: 'Your subscription will renew in 3 days',
      time: '2 days ago'
    }
  ];
  
  // Drawer content for mobile view
  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Avatar
          sx={{ width: 60, height: 60, mb: 1, bgcolor: 'white' }}
        >
          <AccountCircle sx={{ color: 'primary.main', fontSize: 40 }} />
        </Avatar>
        <Typography variant="subtitle1">
          Welcome!
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={item.onClick}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)'
                }
              }
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        {/* Logo and title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: { xs: 1, md: 0 },
            mr: { md: 4 }
          }}
        >
          {isAuthenticated && isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                mr: 1
              }}
            >
              PV
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: { xs: isMobile ? 'none' : 'block', sm: 'block' },
                fontWeight: 'bold'
              }}
            >
              ProductViz
            </Typography>
          </RouterLink>
        </Box>
        
        {/* Navigation links for desktop */}
        {isAuthenticated && !isMobile && (
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{
                  mx: 1,
                  color: 'text.primary',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  borderBottom: location.pathname === item.path ? '2px solid' : 'none',
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main'
                  }
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
        
        {/* Auth buttons for non-authenticated users */}
        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', ml: 'auto' }}>
            <Button 
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{ ml: 1 }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/register"
              sx={{ ml: 1 }}
            >
              Sign Up
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', ml: 'auto' }}>
            {/* Notifications icon and menu */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationOpen}
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User account icon and menu */}
            <Tooltip title="Account">
              <IconButton
                color="inherit"
                onClick={handleUserMenuOpen}
                sx={{ ml: 1 }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
      
      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      {/* User menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/dashboard'); }}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={notificationMenuOpen}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleNotificationClose}
              sx={{ 
                py: 1.5,
                px: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Box>
                <Typography variant="body2">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button
            size="small"
            onClick={() => {
              handleNotificationClose();
              navigate('/notifications');
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </AppBar>
  );
};

export default Navbar;