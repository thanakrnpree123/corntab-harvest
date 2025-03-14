
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CronJob } from "@/lib/types";
import { MoreHorizontal, Play, Pause, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobsTableProps {
  jobs: CronJob[];
  onViewDetails: (job: CronJob) => void;
  onToggleStatus?: (jobId: string) => void;
}

export function JobsTable({ jobs, onViewDetails, onToggleStatus }: JobsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  const handleStatusToggle = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleStatus) {
      onToggleStatus(jobId);
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
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
              <TableCell colSpan={6} className="h-24 text-center">
                No jobs found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id} onClick={() => onViewDetails(job)} className="cursor-pointer hover:bg-muted/30">
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>
                  <code className="px-1 py-0.5 bg-muted rounded text-sm">{job.schedule}</code>
                </TableCell>
                <TableCell>
                  <StatusBadge status={job.status} pulsing={job.status === "running"} />
                </TableCell>
                <TableCell>{formatDate(job.lastRun)}</TableCell>
                <TableCell>{formatDate(job.nextRun)}</TableCell>
                <TableCell className="text-right">
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" /> Run Now
                        </DropdownMenuItem>
                        {job.status !== "paused" ? (
                          <DropdownMenuItem onClick={(e) => handleStatusToggle(job.id, e)}>
                            <Pause className="h-4 w-4 mr-2" /> Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => handleStatusToggle(job.id, e)}>
                            <Play className="h-4 w-4 mr-2" /> Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <AlertCircle className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
