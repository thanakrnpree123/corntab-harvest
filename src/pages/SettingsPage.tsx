
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { azureInsightsService } from "@/lib/azure-insights";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Save, Trash2, RefreshCw, Check } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  
  // Azure Application Insights settings
  const [appId, setAppId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  
  // General settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [jobAutoRetry, setJobAutoRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  
  // Initialize Azure settings from storage
  useEffect(() => {
    const config = azureInsightsService.loadConfig();
    if (config) {
      setAppId(config.appId || "");
      // Don't set API key for security, user needs to re-enter it
    }
  }, []);

  // Save Azure settings
  const saveAzureSettings = () => {
    if (!appId || !apiKey) {
      toast.warning("Please enter both Application ID and API Key");
      return;
    }
    
    azureInsightsService.setConfig({ appId, apiKey });
    toast.success("Azure Application Insights settings saved");
  };

  // Clear Azure settings
  const clearAzureSettings = () => {
    azureInsightsService.clearConfig();
    setAppId("");
    setApiKey("");
    toast({
      title: "Settings cleared",
      description: "Azure Application Insights settings have been removed",
    });
  };

  // Test Azure connection
  const testAzureConnection = async () => {
    if (!appId || !apiKey) {
      toast.warning("Please enter both Application ID and API Key");
      return;
    }
    
    setTestingConnection(true);
    
    try {
      // Temporarily set the config for testing
      azureInsightsService.setConfig({ appId, apiKey });
      
      // Try to execute a simple query
      await azureInsightsService.queryLogs({
        query: 'traces | limit 1',
        timespan: 'PT1H'
      });
      
      toast.success("Successfully connected to Azure Application Insights");
    } catch (error) {
      toast.error(
        "Connection failed. Please check your credentials and ensure your IP is allowed to access the API."
      );
      console.error("Azure connection test error:", error);
    } finally {
      setTestingConnection(false);
    }
  };

  // Save general settings
  const saveGeneralSettings = () => {
    localStorage.setItem("settings", JSON.stringify({
      notificationsEnabled,
      emailNotifications,
      jobAutoRetry,
      maxRetries
    }));
    
    toast.success("General settings saved successfully");
  };

  return (
    <PageLayout title="Settings">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="azure">Azure Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application preferences and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Browser notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in browser when jobs complete or fail
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for failed jobs
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Job Execution</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-retry">Auto retry failed jobs</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry jobs that fail
                    </p>
                  </div>
                  <Switch 
                    id="auto-retry" 
                    checked={jobAutoRetry} 
                    onCheckedChange={setJobAutoRetry} 
                  />
                </div>
                
                {jobAutoRetry && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-retries">Maximum retries</Label>
                      <Input 
                        id="max-retries"
                        type="number" 
                        min="1" 
                        max="10"
                        value={maxRetries} 
                        onChange={(e) => setMaxRetries(parseInt(e.target.value) || 1)} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveGeneralSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="azure" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Azure Application Insights</CardTitle>
              <CardDescription>
                Connect to Azure Application Insights to retrieve log data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-id">Application ID</Label>
                <Input
                  id="app-id"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Azure Application Insights API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The API key is stored securely in your browser's local storage.
                  You'll need to re-enter it if you clear your browser data.
                </p>
              </div>
              
              <div className="pt-2">
                <Alert>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>
                    Make sure your API key has read permissions and your IP address is allowed in the Azure API restrictions.
                  </span>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={clearAzureSettings}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Settings
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={testAzureConnection} 
                  disabled={testingConnection || !appId || !apiKey}
                >
                  {testingConnection ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button onClick={saveAzureSettings} disabled={!appId || !apiKey}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

// Simple alert component
function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
      {children}
    </div>
  );
}
