
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userSettings, setUserSettings] = useState({
    name: "ผู้ใช้",
    email: "user@example.com",
    notifyOnSuccess: true,
    notifyOnFailure: true,
    slackWebhook: "",
    apiKey: "sk_test_•••••••••••••••••••••••••"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "การตั้งค่าของคุณได้รับการบันทึกเรียบร้อยแล้ว",
      });
    }, 1000);
  };

  return (
    <PageLayout title="การตั้งค่า">
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">บัญชีผู้ใช้</TabsTrigger>
          <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลบัญชี</CardTitle>
              <CardDescription>จัดการข้อมูลส่วนตัวของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ</Label>
                  <Input 
                    id="name" 
                    value={userSettings.name}
                    onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกการเปลี่ยนแปลง"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือน</CardTitle>
              <CardDescription>ตั้งค่าการแจ้งเตือนสำหรับ Cron Jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="notify-success">แจ้งเตือนเมื่อ Job สำเร็จ</Label>
                  <Switch 
                    id="notify-success" 
                    checked={userSettings.notifyOnSuccess}
                    onCheckedChange={(checked) => setUserSettings({...userSettings, notifyOnSuccess: checked})}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="notify-failure">แจ้งเตือนเมื่อ Job ล้มเหลว</Label>
                  <Switch 
                    id="notify-failure" 
                    checked={userSettings.notifyOnFailure}
                    onCheckedChange={(checked) => setUserSettings({...userSettings, notifyOnFailure: checked})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input 
                    id="slack-webhook" 
                    placeholder="https://hooks.slack.com/services/..."
                    value={userSettings.slackWebhook}
                    onChange={(e) => setUserSettings({...userSettings, slackWebhook: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกการเปลี่ยนแปลง"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>ความปลอดภัย</CardTitle>
              <CardDescription>จัดการคีย์และการเข้าถึงระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="api-key" 
                      type="password"
                      value={userSettings.apiKey}
                      onChange={(e) => setUserSettings({...userSettings, apiKey: e.target.value})}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => {
                        toast({
                          title: "คัดลอก API Key แล้ว",
                          description: "API Key ได้ถูกคัดลอกไปยังคลิปบอร์ดแล้ว"
                        });
                      }}
                    >
                      คัดลอก
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => {
                      toast({
                        title: "สร้าง API Key ใหม่แล้ว",
                        description: "API Key เดิมจะไม่สามารถใช้งานได้อีกต่อไป"
                      });
                      setUserSettings({...userSettings, apiKey: "sk_test_" + Math.random().toString(36).substring(2, 15)});
                    }}
                  >
                    สร้าง API Key ใหม่
                  </Button>
                  <p className="text-sm text-muted-foreground">การสร้าง API Key ใหม่จะทำให้ Key เดิมไม่สามารถใช้งานได้</p>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกการเปลี่ยนแปลง"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
