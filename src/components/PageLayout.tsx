
import { ReactNode } from "react";
import { Container, Typography, Box } from "@mui/material";
import { Navbar } from "@/components/Navbar";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f8f9fa' : '#121212' 
    }}>
      <Navbar />
      
      <Container component="main" sx={{ 
        flexGrow: 1, 
        py: 3, 
        px: { xs: 2, sm: 3, lg: 4 } 
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" fontWeight="600">
            {title}
          </Typography>
          {children}
        </Box>
      </Container>
    </Box>
  );
}
