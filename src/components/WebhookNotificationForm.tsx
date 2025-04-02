
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WebhookNotificationFormProps {
  webhookUrl: string;
  onChange: (webhookUrl: string) => void;
}

export function WebhookNotificationForm({ webhookUrl, onChange }: WebhookNotificationFormProps) {
  const [enableWebhook, setEnableWebhook] = useState(!!webhookUrl);
  const [webhookUrlInput, setWebhookUrlInput] = useState(webhookUrl || "");
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleEnableToggle = (enabled: boolean) => {
    setEnableWebhook(enabled);
    if (!enabled) {
      onChange("");
    } else if (isValidUrl) {
      onChange(webhookUrlInput);
    }
  };

  const handleUrlChange = (url: string) => {
    setWebhookUrlInput(url);
    const valid = url === "" || validateUrl(url);
    setIsValidUrl(valid);
    if (enableWebhook && valid && url) {
      onChange(url);
    } else if (enableWebhook && !url) {
      onChange("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-webhook" className="font-medium text-sm">
          Enable Webhook Notifications
        </Label>
        <Switch
          id="enable-webhook"
          checked={enableWebhook}
          onCheckedChange={handleEnableToggle}
        />
      </div>

      {enableWebhook && (
        <>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://example.com/webhook"
              value={webhookUrlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={!isValidUrl ? "border-red-500" : ""}
            />
            {!isValidUrl && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please enter a valid URL</AlertDescription>
              </Alert>
            )}
          </div>

          <Tabs defaultValue="usage">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usage">Usage Info</TabsTrigger>
              <TabsTrigger value="payload">Sample Payload</TabsTrigger>
            </TabsList>
            <TabsContent value="usage" className="space-y-4 mt-2">
              <div className="text-sm text-muted-foreground">
                <p>Your webhook will receive a POST request when a job completes execution.</p>
                <p>Make sure your endpoint can handle POST requests and process JSON data.</p>
              </div>
            </TabsContent>
            <TabsContent value="payload" className="mt-2">
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[200px]">
{`{
  "jobId": "job-123",
  "jobName": "My Scheduled Task",
  "status": "success", // or "failed"
  "executionTime": "2023-10-15T14:30:00Z",
  "duration": 1250, // milliseconds
  "output": "Task completed successfully"
}`}
              </pre>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Separator className="my-4" />
    </div>
  );
}
