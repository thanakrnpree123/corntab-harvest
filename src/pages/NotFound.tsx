
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        bgcolor: "background.default" 
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h2" fontWeight="bold" mb={2}>404</Typography>
        <Typography variant="h5" color="text.secondary" mb={3}>Oops! Page not found</Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          color="primary"
        >
          Return to Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
