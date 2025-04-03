
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Link as MuiLink,
  Container
} from "@mui/material";
import { Snackbar, Alert } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: "",
    severity: 'success'
  });
  const navigate = useNavigate();

  const handleCloseToast = () => {
    setToast({...toast, open: false});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock successful login after 1 second
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email with valid format and any non-empty password
      if (!email.includes('@') || password.trim() === '') {
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
      
      // Store user data in localStorage as a simple auth mechanism
      localStorage.setItem('user', JSON.stringify({
        email,
        name: email.split('@')[0],
        role: 'admin',
        isLoggedIn: true
      }));

      setToast({
        open: true,
        message: "เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับ",
        severity: 'success'
      });

      window.location.href="/";
      // navigate('/'); // Redirect to dashboard after login
    } catch (error) {
      setToast({
        open: true,
        message: error instanceof Error ? error.message : "กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        bgcolor: "background.default"
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={3}>
          <CardHeader 
            title="CronHub" 
            subheader="เข้าสู่ระบบเพื่อจัดการ Cron Jobs ของคุณ"
            sx={{ textAlign: 'center', pb: 1 }}
          />
          <CardContent>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, mb: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="อีเมล"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">รหัสผ่าน</Typography>
                <MuiLink 
                  component="button"
                  variant="body2"
                  onClick={() => setToast({open: true, message: "ฟีเจอร์นี้ยังไม่เปิดให้ใช้งาน", severity: 'info'})}
                  type="button"
                >
                  ลืมรหัสผ่าน?
                </MuiLink>
              </Box>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="รหัสผ่าน"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" display="inline">
                  ยังไม่มีบัญชี?{' '}
                </Typography>
                <MuiLink 
                  component="button" 
                  variant="body2"
                  onClick={() => setToast({open: true, message: "ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้", severity: 'info'})}
                  type="button"
                >
                  ลงทะเบียน
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
