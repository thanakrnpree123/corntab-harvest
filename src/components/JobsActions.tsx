
import { CronJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Play, FileEdit, Copy, Trash2, MoreVertical, Pause } from "lucide-react";
import { useState } from "react";
import { EditJobModal } from "./EditJobModal";

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
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Open actions menu for job"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg z-20">
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                if (onToggleStatus) onToggleStatus(job.id);
                setDropdownOpen(false);
              }}
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onEditJob(job);
                setDropdownOpen(false);
              }}
              data-testid="job-edit-btn"
            >
              <FileEdit className="w-4 h-4" />
              Edit
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                if (onDuplicateJob) onDuplicateJob(job.id);
                setDropdownOpen(false);
              }}
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-red-500 hover:bg-red-50"
              onClick={() => {
                if (onDeleteJob) onDeleteJob(job.id);
                setDropdownOpen(false);
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
