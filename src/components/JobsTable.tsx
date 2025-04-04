
import { CronJob } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            {showLastRun && <TableHead>Last Run</TableHead>}
            {showNextRun && <TableHead>Next Run</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            return (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>
                  <code className="bg-muted text-xs px-1 py-0.5 rounded">
                    {job.schedule}
                  </code>
                </TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                {showLastRun && (
                  <TableCell>
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
                      <span className="text-xs text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                )}
                {showNextRun && (
                  <TableCell>
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
                      <span className="text-xs text-muted-foreground">Not scheduled</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right flex justify-end items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(job)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {onToggleStatus(job.id)}
                  {onDuplicateJob && onDuplicateJob(job.id)}
                  {onDeleteJob(job.id)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {jobs.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">No jobs found</div>
      )}
    </div>
  );
}
