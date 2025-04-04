
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MenuIcon, User, Settings, LogOut, AlarmClock } from "lucide-react";
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Typography,
  Divider,
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon
} from "@mui/material";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // โหลดข้อมูลผู้ใช้จาก localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Jobs", href: "/jobs" },
    { name: "Logs", href: "/logs" },
    { name: "Users", href: "/users" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "คุณได้ออกจากระบบแล้ว",
    });
    navigate("/login");
    setAnchorEl(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box 
          component={Link} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            textDecoration: 'none', 
            color: 'text.primary',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}
        >
          <AlarmClock size={24} />
          <Typography variant="h6" noWrap>
            CornTab
          </Typography>
        </Box>

        {/* Desktop menu */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
          {navLinks.map((link) => (
            <Button
              key={link.name}
              component={Link}
              to={link.href}
              variant="ghost"
              sx={{ mx: 1 }}
            >
              {link.name}
            </Button>
          ))}
        </Box>

        {/* Mobile menu toggle */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
          <IconButton
            size="large"
            aria-label="open drawer"
            onClick={() => setIsMenuOpen(true)}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile drawer menu */}
        <Drawer
          anchor="left"
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        >
          <Box
            sx={{ width: 250, pt: 2, pb: 2 }}
            role="presentation"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
              <AlarmClock size={24} />
              <Typography variant="h6" sx={{ ml: 1 }}>
                CornTab
              </Typography>
            </Box>
            <Divider />
            <List>
              {navLinks.map((link) => (
                <ListItem 
                  button 
                  key={link.name}
                  onClick={() => handleMenuItemClick(link.href)}
                >
                  <ListItemText primary={link.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThemeSwitcher />
          
          {user && (
            <>
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ ml: 2 }}
              >
                <MuiAvatar
                  alt={user.name}
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseUserMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => {
                  navigate("/users");
                  handleCloseUserMenu();
                }}>
                  <ListItemIcon>
                    <User size={18} />
                  </ListItemIcon>
                  <Typography variant="body2">โปรไฟล์</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  navigate("/settings");
                  handleCloseUserMenu();
                }}>
                  <ListItemIcon>
                    <Settings size={18} />
                  </ListItemIcon>
                  <Typography variant="body2">ตั้งค่า</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogOut size={18} />
                  </ListItemIcon>
                  <Typography variant="body2">ออกจากระบบ</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
