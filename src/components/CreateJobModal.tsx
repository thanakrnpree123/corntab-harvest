
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
import { toast } from "sonner";
import { Project } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [requestBody, setRequestBody] = useState("");
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("cron");
  const [projectId, setProjectId] = useState(selectedProjectId);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Bangkok";
    } catch {
      return "Asia/Bangkok"; // Default to Bangkok timezone if browser API not available
    }
  });

  const handleCreateJob = () => {
    if (!jobName || !endpoint || !schedule) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newJob = {
      name: jobName,
      endpoint,
      httpMethod,
      requestBody: httpMethod !== "GET" ? requestBody : "",
      schedule,
      description,
      projectId,
      timezone: useLocalTime ? timezone : "UTC",
      useLocalTime,
    };

    onCreateJob(newJob);
    resetForm();
    onClose();
    toast.success("Job created successfully");
  };

  const resetForm = () => {
    setJobName("");
    setEndpoint("");
    setHttpMethod("GET");
    setRequestBody("");
    setSchedule("");
    setDescription("");
    setScheduleType("cron");
    setProjectId(selectedProjectId);
    setUseLocalTime(true);
    // ไม่รีเซ็ต timezone เพื่อให้ผู้ใช้ไม่ต้องเลือกใหม่ทุกครั้ง
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new scheduled job to your CornTab management system.
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
              <Label htmlFor="requestBody">Request Body (JSON)</Label>
              <Textarea
                id="requestBody"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="min-h-[80px] font-mono text-sm"
              />
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleCreateJob}>Create Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
