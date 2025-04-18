
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
import { ChevronRight, Play } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { BatchJobsActions } from "./BatchJobsActions";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export interface JobsTableProps {
  jobs: CronJob[];
  onViewDetails: (job: CronJob) => void;
  onToggleStatus: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onDuplicateJob?: (jobId: string) => void;
  onTriggerJob?: (jobId: string) => void;
  onExportJobs?: (jobIds: string[], format: "json" | "csv") => void;
  onImportJobs?: (jobs: Partial<CronJob>[]) => void;
  onBatchDeleteJobs?: (jobIds: string[]) => void;
  onRefresh?: () => void;
  showLastRun?: boolean;
  showNextRun?: boolean;
}

export function JobsTable({
  jobs,
  onViewDetails,
  onToggleStatus,
  onDeleteJob,
  onDuplicateJob,
  onTriggerJob,
  onExportJobs,
  onImportJobs,
  onBatchDeleteJobs,
  onRefresh,
  showLastRun = true,
  showNextRun = true,
}: JobsTableProps) {
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  
  // Reset selection when jobs change
  useEffect(() => {
    setSelectedJobIds([]);
  }, [jobs]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobIds(jobs.map(job => job.id));
    } else {
      setSelectedJobIds([]);
    }
  };
  
  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds(prev => [...prev, jobId]);
    } else {
      setSelectedJobIds(prev => prev.filter(id => id !== jobId));
    }
  };
  
  const handleExport = (format: "json" | "csv") => {
    if (onExportJobs && selectedJobIds.length > 0) {
      onExportJobs(selectedJobIds, format);
    }
  };
  
  const handleImport = (jobsToImport: Partial<CronJob>[]) => {
    if (onImportJobs) {
      onImportJobs(jobsToImport);
    }
  };
  
  const handleBatchDelete = () => {
    if (onBatchDeleteJobs && selectedJobIds.length > 0) {
      onBatchDeleteJobs(selectedJobIds);
      setSelectedJobIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {(onExportJobs || onImportJobs || onBatchDeleteJobs) && (
        <div className="flex justify-between items-center mb-4">
          <BatchJobsActions
            jobs={jobs}
            selectedJobIds={selectedJobIds}
            onExport={handleExport}
            onImport={handleImport}
            onDeleteSelected={handleBatchDelete}
            disabled={jobs.length === 0}
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              {(onExportJobs || onBatchDeleteJobs) && (
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={jobs.length > 0 && selectedJobIds.length === jobs.length} 
                    onCheckedChange={handleSelectAll}
                    disabled={jobs.length === 0}
                    aria-label="Select all jobs"
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Schedule</TableHead>
              <TableHead>Status</TableHead>
              {showLastRun && <TableHead className="hidden md:table-cell">Last Run</TableHead>}
              {showNextRun && <TableHead className="hidden md:table-cell">Next Run</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(onExportJobs || onBatchDeleteJobs) ? (showLastRun && showNextRun ? 7 : showLastRun || showNextRun ? 6 : 5) : (showLastRun && showNextRun ? 6 : showLastRun || showNextRun ? 5 : 4)} className="text-center py-6 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => {
                return (
                  <TableRow key={job.id}>
                    {(onExportJobs || onBatchDeleteJobs) && (
                      <TableCell>
                        <Checkbox 
                          checked={selectedJobIds.includes(job.id)} 
                          onCheckedChange={(checked) => handleSelectJob(job.id, checked === true)}
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

                      <div className="flex items-center gap-2">
                        {onTriggerJob && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onTriggerJob(job.id)}
                            title="Trigger job"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant={job.status === "paused" ? "default" : "outline"}
                          size="icon"
                          onClick={() => onToggleStatus(job.id)}
                          title={job.status === "paused" ? "Resume job" : "Pause job"}
                        >
                          {job.status === "paused" ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          )}
                        </Button>
                        
                        <div className="hidden sm:block">
                          {onDuplicateJob && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onDuplicateJob(job.id)}
                              title="Duplicate job"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="8" y="8" width="12" height="12" rx="2" />
                                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                              </svg>
                            </Button>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDeleteJob(job.id)}
                          className="text-destructive"
                          title="Delete job"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-destructive"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </Button>
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
