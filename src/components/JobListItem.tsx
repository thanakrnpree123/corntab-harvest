
import { CronJob } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Server, Calendar, Clock } from "lucide-react";
import dayjs from "dayjs";

export function JobListItem({
  job,
  projectName,
  isSelected,
  onSelect,
}: {
  job: CronJob;
  projectName?: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium truncate mr-2">{job.name}</div>
        <StatusBadge status={job.status} />
      </div>
      {projectName && (
        <div className="text-xs text-muted-foreground mb-1">
          Project: {projectName}
        </div>
      )}
      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          <span>{job.httpMethod}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{job.schedule}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {job.lastRun 
              ? dayjs(job.lastRun).format('DD/MM HH:mm')
              : "Never run"}
          </span>
        </div>
      </div>
    </button>
  );
}
