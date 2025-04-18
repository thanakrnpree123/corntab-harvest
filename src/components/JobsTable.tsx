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
  onToggleStatus: (jobId: string) => React.ReactNode;
  onDeleteJob: (jobId: string) => React.ReactNode;
  onDuplicateJob?: (jobId: string) => React.ReactNode;
  onTriggerJob?: (jobId: string) => React.ReactNode; // Add new prop for triggering jobs
  onExportJobs?: (jobIds: string[], format: "json" | "csv") => void;
  onImportJobs?: (jobs: Partial<CronJob>[]) => void;
  onBatchDeleteJobs?: (jobIds: string[]) => void;
  showLastRun?: boolean;
  showNextRun?: boolean;
  selectedProject?: string; // Add new prop for project filtering
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
  showLastRun = true,
  showNextRun = true,
  selectedProject,
}: JobsTableProps) {
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  
  // Reset selection when jobs change
  useEffect(() => {
    setSelectedJobIds([]);
  }, [jobs]);

  const handleViewDetails = (job: CronJob) => {
    onViewDetails(job);
    toast({
      title: "ดูรายละเอียดงาน",
      description: `กำลังดูรายละเอียดของงาน "${job.name}"`,
    });
  };
  
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

  // Filter jobs based on selected project
  const filteredJobs = jobs.filter(job => {
    if (selectedProject && selectedProject !== 'all') {
      return job.projectId === selectedProject;
    }
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "date":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "lastRun":
        if (!a.lastRun && !b.lastRun) comparison = 0;
        else if (!a.lastRun) comparison = 1;
        else if (!b.lastRun) comparison = -1;
        else
          comparison =
            new Date(a.lastRun).getTime() - new Date(b.lastRun).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
              sortedJobs.map((job) => {
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
                        onClick={() => handleViewDetails(job)}
                        className="hidden sm:inline-flex"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        {onTriggerJob && onTriggerJob(job.id)}
                        {onToggleStatus(job.id)}
                        
                        <div className="hidden sm:block">
                          {onDuplicateJob && onDuplicateJob(job.id)}
                        </div>
                        
                        {onDeleteJob(job.id)}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(job)}
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
