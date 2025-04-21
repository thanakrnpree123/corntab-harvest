
import { CronJob } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { JobActions } from "./JobsActions";

interface JobRowDisplayProps {
  job: CronJob;
  isSelected: boolean;
  onSelect: (jobId: string, checked: boolean) => void;
  onViewDetails: (job: CronJob) => void;
  onToggleStatus: (jobId: string) => React.ReactNode;
  onDeleteJob: (jobId: string) => React.ReactNode;
  onDuplicateJob?: (jobId: string) => React.ReactNode;
  onTriggerJob?: (jobId: string) => React.ReactNode;
  onEditJob: (job: CronJob) => void;
  showCheckbox: boolean;
  showLastRun: boolean;
  showNextRun: boolean;
}

export function JobRowDisplay({
  job,
  isSelected,
  onSelect,
  onViewDetails,
  onToggleStatus,
  onDeleteJob,
  onDuplicateJob,
  onTriggerJob,
  onEditJob,
  showCheckbox,
  showLastRun,
  showNextRun,
}: JobRowDisplayProps) {
  return (
    <TableRow>
      {showCheckbox && (
        <TableCell>
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={(checked) => onSelect(job.id, checked === true)}
            aria-label={`Select job ${job.name}`}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        <div className="font-medium">{job.name}</div>
        <div className="text-xs text-muted-foreground md:hidden">
          {job.schedule}
        </div>
        {showLastRun && (
          <div className="text-xs text-muted-foreground md:hidden">
            Last: {job.lastRun 
              ? dayjs(job.lastRun).format("MM/DD HH:mm") 
              : "Never"}
          </div>
        )}
        {showNextRun && (
          <div className="text-xs text-muted-foreground md:hidden">
            Next: {job.nextRun 
              ? dayjs(job.nextRun).format("MM/DD HH:mm") 
              : "Not scheduled"}
          </div>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <code className="bg-muted text-xs px-1 py-0.5 rounded">
          {job.schedule}
        </code>
      </TableCell>
      <TableCell>
        <StatusBadge status={job.status} />
      </TableCell>
      {showLastRun && (
        <TableCell className="hidden md:table-cell">
          {job.lastRun ? (
            <div>
              <div className="text-xs text-muted-foreground">
                {dayjs(job.lastRun).format("MMM DD, YYYY - HH:mm")}
              </div>
              <div className="text-xs text-muted-foreground">
                {dayjs(job.lastRun).fromNow()}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Never
            </span>
          )}
        </TableCell>
      )}
      {showNextRun && (
        <TableCell className="hidden md:table-cell">
          {job.nextRun ? (
            <div>
              <div className="text-xs text-muted-foreground">
                {dayjs(job.nextRun).format("MMM DD, YYYY - HH:mm")}
              </div>
              <div className="text-xs text-muted-foreground">
                {dayjs(job.nextRun).fromNow()}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Not scheduled
            </span>
          )}
        </TableCell>
      )}
      <TableCell className="text-right flex justify-end items-center gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails(job)}
          className="hidden sm:inline-flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <JobActions 
          job={job}
          onViewDetails={onViewDetails}
          onToggleStatus={onToggleStatus}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
          onDuplicateJob={onDuplicateJob}
          onTriggerJob={onTriggerJob}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(job)}
          className="sm:hidden w-full mt-1"
        >
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
}
