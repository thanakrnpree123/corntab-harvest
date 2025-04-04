
import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Box, Container, Typography } from "@mui/material";

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
      bgcolor: 'background.default' 
    }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" fontWeight="600">{title}</Typography>
          {children}
        </Box>
      </Container>
    </Box>
  );
}
