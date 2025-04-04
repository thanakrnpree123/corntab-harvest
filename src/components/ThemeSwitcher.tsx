
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button, Menu, MenuItem, IconButton } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ComputerIcon from '@mui/icons-material/Computer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    handleClose();
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Brightness7Icon />;
      case "dark":
        return <Brightness4Icon />;
      case "system":
        return <ComputerIcon />;
      default:
        return <Brightness7Icon />;
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={getThemeIcon()}
        endIcon={<ArrowDropDownIcon />}
        size="small"
      >
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
      >
        <MenuItem onClick={() => toggleTheme("light")}>
          <Brightness7Icon sx={{ mr: 1 }} />
          Light
        </MenuItem>
        <MenuItem onClick={() => toggleTheme("dark")}>
          <Brightness4Icon sx={{ mr: 1 }} />
          Dark
        </MenuItem>
        <MenuItem onClick={() => toggleTheme("system")}>
          <ComputerIcon sx={{ mr: 1 }} />
          System
        </MenuItem>
      </Menu>
    </>
  );
}
