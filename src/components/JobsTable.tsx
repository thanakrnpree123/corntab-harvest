
import { useState } from "react";
import { CronJob } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, Pause, Play } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobsTableProps {
  jobs: CronJob[];
  onViewDetails: (job: CronJob) => void;
  onToggleStatus: (jobId: string) => React.ReactNode;
  onDeleteJob: (jobId: string) => React.ReactNode;
}

export function JobsTable({ jobs, onViewDetails, onToggleStatus, onDeleteJob }: JobsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No jobs found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-2 px-2 py-1 text-xs font-medium bg-slate-100 rounded">
                      {job.httpMethod}
                    </span>
                    <span className="text-sm truncate max-w-xs">{job.endpoint}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{job.schedule}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  {job.lastRun ? formatDate(job.lastRun) : "-"}
                </TableCell>
                <TableCell>
                  {job.nextRun ? formatDate(job.nextRun) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(job)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                    {onToggleStatus(job.id)}
                    {onDeleteJob(job.id)}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
