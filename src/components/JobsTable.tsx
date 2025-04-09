
import { CronJob } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export interface JobsTableProps {
  jobs: CronJob[];
  onViewDetails: (job: CronJob) => void;
  onToggleStatus: (jobId: string) => React.ReactNode;
  onDeleteJob: (jobId: string) => React.ReactNode;
  onDuplicateJob?: (jobId: string) => React.ReactNode;
  showLastRun?: boolean;
  showNextRun?: boolean;
}

export function JobsTable({
  jobs,
  onViewDetails,
  onToggleStatus,
  onDeleteJob,
  onDuplicateJob,
  showLastRun = true,
  showNextRun = true,
}: JobsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Schedule</TableHead>
            <TableHead>Status</TableHead>
            {showLastRun && <TableHead className="hidden md:table-cell">Last Run</TableHead>}
            {showNextRun && <TableHead className="hidden md:table-cell">Next Run</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            return (
              <TableRow key={job.id}>
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

                  <div className="flex items-center gap-2">
                    {onToggleStatus(job.id)}
                    
                    <div className="hidden sm:block">
                      {onDuplicateJob && onDuplicateJob(job.id)}
                    </div>
                    
                    {onDeleteJob(job.id)}
                  </div>
                  
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
          })}
        </TableBody>
      </Table>
      {jobs.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No jobs found
        </div>
      )}
    </div>
  );
}
