
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Project } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  X, 
  Plus, 
  Mail, 
  Code, 
  FileText, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Common HTTP methods
const httpMethods = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PATCH", label: "PATCH" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
];

// Common timezone list
const commonTimezones = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+7)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "America/New_York", label: "America/New_York (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8/-7)" },
  { value: "Europe/London", label: "Europe/London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1/+2)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10/+11)" },
];

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (jobData: any) => void;
  projects: Project[];
  selectedProjectId: string;
}

interface KeyValuePair {
  key: string;
  value: string;
}

export function CreateJobModal({ 
  isOpen, 
  onClose, 
  onCreateJob, 
  projects, 
  selectedProjectId 
}: CreateJobModalProps) {
  const [jobName, setJobName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [requestBodyType, setRequestBodyType] = useState<"json" | "formdata">("json");
  const [requestBody, setRequestBody] = useState("");
  const [formDataPairs, setFormDataPairs] = useState<KeyValuePair[]>([{ key: "", value: "" }]);
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("cron");
  const [projectId, setProjectId] = useState(selectedProjectId);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [sendEmailNotifications, setSendEmailNotifications] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC"; // Default to UTC if browser API not available
    }
  });

  const validateJson = (jsonString: string) => {
    if (!jsonString) return true;
    
    try {
      JSON.parse(jsonString);
      setIsJsonValid(true);
      return true;
    } catch (e) {
      setIsJsonValid(false);
      return false;
    }
  };

  const validateEmails = (emails: string): boolean => {
    if (!emails) return true;
    
    const emailList = emails.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailList.every(email => emailRegex.test(email));
  };

  const handleAddFormDataPair = () => {
    setFormDataPairs([...formDataPairs, { key: "", value: "" }]);
  };

  const handleRemoveFormDataPair = (index: number) => {
    const updatedPairs = [...formDataPairs];
    updatedPairs.splice(index, 1);
    setFormDataPairs(updatedPairs);
  };

  const handleUpdateFormDataPair = (index: number, field: 'key' | 'value', newValue: string) => {
    const updatedPairs = [...formDataPairs];
    updatedPairs[index][field] = newValue;
    setFormDataPairs(updatedPairs);
  };

  const buildFormDataBody = () => {
    const dataObject: Record<string, string> = {};
    formDataPairs.forEach(pair => {
      if (pair.key.trim()) {
        dataObject[pair.key] = pair.value;
      }
    });
    return JSON.stringify(dataObject);
  };

  const handleCreateJob = () => {
    if (!jobName || !endpoint || !schedule) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate JSON if using JSON body type
    if (httpMethod !== "GET" && requestBodyType === "json" && !validateJson(requestBody)) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON in the request body",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    if (sendEmailNotifications && !validateEmails(emailRecipients)) {
      toast({
        title: "Invalid email format",
        description: "Please enter valid email addresses separated by commas",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const finalRequestBody = httpMethod !== "GET" 
      ? (requestBodyType === "json" ? requestBody : buildFormDataBody())
      : "";

    const newJob = {
      name: jobName,
      endpoint,
      httpMethod,
      requestBody: finalRequestBody,
      schedule,
      description,
      projectId,
      timezone: useLocalTime ? timezone : "UTC",
      useLocalTime,
      emailNotifications: sendEmailNotifications ? {
        recipients: emailRecipients.split(',').map(email => email.trim()),
      } : null,
      tags: [],
    };

    try {
      onCreateJob(newJob);
      resetForm();
      onClose();
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobName("");
    setEndpoint("");
    setHttpMethod("GET");
    setRequestBody("");
    setRequestBodyType("json");
    setFormDataPairs([{ key: "", value: "" }]);
    setSchedule("");
    setDescription("");
    setScheduleType("cron");
    setProjectId(selectedProjectId);
    setUseLocalTime(true);
    setSendEmailNotifications(false);
    setEmailRecipients("");
    setIsJsonValid(true);
    // Don't reset timezone to preserve user preference
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const scheduleExamples = {
    cron: "* * * * *",
    interval: "30s, 5m, 1h",
    fixed: "YYYY-MM-DD HH:MM:SS",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new scheduled job to your CronTab management system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Job Name *</Label>
            <Input
              id="name"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Daily API Health Check"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="httpMethod">HTTP Method</Label>
            <Select value={httpMethod} onValueChange={setHttpMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                {httpMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endpoint">Endpoint URL *</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/health"
            />
          </div>

          {httpMethod !== "GET" && (
            <div className="grid gap-2">
              <Label>Request Body</Label>
              <Tabs 
                defaultValue={requestBodyType} 
                onValueChange={(value) => setRequestBodyType(value as "json" | "formdata")}
                className="w-full"
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="json" className="flex gap-1 items-center">
                    <Code size={14} />
                    Raw JSON
                  </TabsTrigger>
                  <TabsTrigger value="formdata" className="flex gap-1 items-center">
                    <FileText size={14} />
                    Form Data
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="json">
                  <div className="space-y-2">
                    <Textarea
                      value={requestBody}
                      onChange={(e) => {
                        setRequestBody(e.target.value);
                        validateJson(e.target.value);
                      }}
                      placeholder='{"key": "value"}'
                      className={cn(
                        "min-h-[120px] font-mono text-sm",
                        !isJsonValid && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {!isJsonValid && (
                      <Alert variant="destructive" className="p-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Invalid JSON format
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="formdata">
                  <div className="space-y-3">
                    {formDataPairs.map((pair, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Key"
                          value={pair.key}
                          onChange={(e) => handleUpdateFormDataPair(index, 'key', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={pair.value}
                          onChange={(e) => handleUpdateFormDataPair(index, 'value', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFormDataPair(index)}
                          disabled={formDataPairs.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddFormDataPair}
                      className="mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Schedule Type</Label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select schedule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cron">Cron Expression</SelectItem>
                <SelectItem value="interval">Time Interval</SelectItem>
                <SelectItem value="fixed">Fixed Time</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground mt-1">
              Example: {scheduleExamples[scheduleType as keyof typeof scheduleExamples]}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="schedule">Schedule *</Label>
            <Input
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder={scheduleExamples[scheduleType as keyof typeof scheduleExamples]}
            />
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <Checkbox 
              id="use-local-time" 
              checked={useLocalTime} 
              onCheckedChange={(checked) => setUseLocalTime(checked as boolean)}
            />
            <Label 
              htmlFor="use-local-time" 
              className="text-sm font-normal"
            >
              Use local time instead of UTC
            </Label>
          </div>

          {useLocalTime && (
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {commonTimezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-1">
            <Checkbox 
              id="send-email" 
              checked={sendEmailNotifications} 
              onCheckedChange={(checked) => setSendEmailNotifications(checked as boolean)}
            />
            <Label 
              htmlFor="send-email" 
              className="text-sm font-normal flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Send email notifications
            </Label>
          </div>

          {sendEmailNotifications && (
            <div className="grid gap-2">
              <Label htmlFor="email-recipients">Email Recipients</Label>
              <Input
                id="email-recipients"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="email@example.com, another@example.com"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Separate multiple email addresses with commas
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Regular health check of the API endpoints"
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateJob} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
