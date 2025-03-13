
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
  const [command, setCommand] = useState("");
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("cron");
  const [projectId, setProjectId] = useState(selectedProjectId);

  const handleCreateJob = () => {
    if (!jobName || !command || !schedule) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newJob = {
      name: jobName,
      command,
      schedule,
      description,
      projectId,
    };

    onCreateJob(newJob);
    resetForm();
    onClose();
    toast.success("Job created successfully");
  };

  const resetForm = () => {
    setJobName("");
    setCommand("");
    setSchedule("");
    setDescription("");
    setScheduleType("cron");
    setProjectId(selectedProjectId);
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
              placeholder="Daily Database Backup"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="command">Command *</Label>
            <Textarea
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="pg_dump -U postgres database > backup.sql"
              className="min-h-[80px]"
            />
          </div>

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

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Backup of the main database that runs every night at midnight"
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
