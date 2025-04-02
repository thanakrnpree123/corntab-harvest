
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับ",
      });

      window.location.href="/"     
      // navigate('/'); // Redirect to dashboard after login
    } catch (error) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error instanceof Error ? error.message : "กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">CronHub</CardTitle>
            <CardDescription>เข้าสู่ระบบเพื่อจัดการ Cron Jobs ของคุณ</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Button type="button" variant="link" className="px-0 text-xs text-blue-500 hover:text-blue-600">
                    ลืมรหัสผ่าน?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                ยังไม่มีบัญชี?{' '}
                <Button type="button" variant="link" className="p-0" onClick={() => toast({
                  title: "ยังไม่เปิดให้ลงทะเบียน",
                  description: "ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้"
                })}>
                  ลงทะเบียน
                </Button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
