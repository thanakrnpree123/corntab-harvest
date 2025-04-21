
import { CronJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Play, Edit, Copy, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";

interface JobActionsProps {
  job: CronJob;
  onViewDetails: (job: CronJob) => void;
  onToggleStatus: (jobId: string) => React.ReactNode;
  onEditJob: (job: CronJob) => void;
  onDeleteJob: (jobId: string) => React.ReactNode;
  onDuplicateJob?: (jobId: string) => React.ReactNode;
  onTriggerJob?: (jobId: string) => React.ReactNode;
}

export function JobActions({
  job,
  onViewDetails,
  onToggleStatus,
  onEditJob,
  onDeleteJob,
  onDuplicateJob,
  onTriggerJob,
}: JobActionsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  return (
    <div className="flex items-center gap-2">
      {onTriggerJob && onTriggerJob(job.id)}
      {onToggleStatus(job.id)}
      <div className="relative group">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Open actions menu for job"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {(dropdownOpen || true) && (
          <div className="absolute right-0 mt-2 w-36 rounded-md border border-muted bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-muted/50"
              onClick={() => {
                if (onTriggerJob) onTriggerJob(job.id);
              }}
            >
              <Play className="w-4 h-4" />
              Activate
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-muted/50"
              onClick={() => {
                onEditJob(job);
              }}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-muted/50"
              onClick={() => {
                if (onDuplicateJob) onDuplicateJob(job.id);
              }}
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (onDeleteJob) onDeleteJob(job.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
