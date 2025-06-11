import { CronJob } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EditJobModal } from "./EditJobModal";
import { useEffect, useState, useMemo, memo, useRef } from "react";
import { BatchJobsActions } from "./BatchJobsActions";
import { JobRowDisplay } from "./JobRowDisplay";
import { toast } from "@/components/ui/use-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';

dayjs.extend(relativeTime);

// Memoized JobRow component
const MemoizedJobRow = memo(JobRowDisplay);

export interface JobsTableProps {
  jobs: CronJob[];
  onViewDetails: (job: CronJob) => void;
  onToggleStatus: (jobId: string) => React.ReactNode;
  onDeleteJob: (jobId: string) => React.ReactNode;
  onDuplicateJob?: (jobId: string) => React.ReactNode;
  onTriggerJob?: (jobId: string) => React.ReactNode;
  onExportJobs?: (jobIds: string[], format: "json" | "csv") => void;
  onImportJobs?: (jobs: Partial<CronJob>[]) => void;
  onBatchDeleteJobs?: (jobIds: string[]) => void;
  showLastRun?: boolean;
  showNextRun?: boolean;
  onEditJob?: (job: CronJob) => void;
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
  onEditJob,
}: JobsTableProps) {
  const { t } = useTranslation();
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [editModalJob, setEditModalJob] = useState<CronJob | null>(null);

  // Memoize handlers to prevent unnecessary re-renders
  const handlers = useMemo(() => ({
    handleViewDetails: (job: CronJob) => {
      onViewDetails(job);
      toast({
        title: t('job.viewDetails'),
        description: t('job.viewingJob', { name: job.name }),
      });
    },
    handleSelectAll: (checked: boolean) => {
      setSelectedJobIds(checked ? jobs.map((job) => job.id) : []);
    },
    handleSelectJob: (jobId: string, checked: boolean) => {
      setSelectedJobIds((prev) => 
        checked ? [...prev, jobId] : prev.filter((id) => id !== jobId)
      );
    },
    handleExport: (format: "json" | "csv") => {
      if (onExportJobs && selectedJobIds.length > 0) {
        onExportJobs(selectedJobIds, format);
      }
    },
    handleImport: (jobsToImport: Partial<CronJob>[]) => {
      if (onImportJobs) {
        onImportJobs(jobsToImport);
      }
    },
    handleBatchDelete: () => {
      if (onBatchDeleteJobs && selectedJobIds.length > 0) {
        onBatchDeleteJobs(selectedJobIds);
        setSelectedJobIds([]);
      }
    },
    handleEdit: (job: CronJob) => {
      setEditModalJob(job);
    },
    handleCloseEditModal: () => {
      setEditModalJob(null);
    },
    handleSubmitEdit: (updatedJob: CronJob) => {
      if (onEditJob) onEditJob(updatedJob);
      setEditModalJob(null);
      toast({
        title: t('job.saveSuccess'),
        description: t('job.jobUpdated', { name: updatedJob.name }),
      });
    },
  }), [jobs, selectedJobIds, onExportJobs, onImportJobs, onBatchDeleteJobs, onEditJob, t]);

  useEffect(() => {
    setSelectedJobIds([]);
  }, [jobs]);

  const showCheckbox = !!(onExportJobs || onBatchDeleteJobs);

  // Setup virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });

  return (
    <div className="space-y-4">
      {(onExportJobs || onImportJobs || onBatchDeleteJobs) && (
        <div className="flex justify-between items-center mb-4">
          <BatchJobsActions
            jobs={jobs}
            selectedJobIds={selectedJobIds}
            onExport={handlers.handleExport}
            onImport={handlers.handleImport}
            onDeleteSelected={handlers.handleBatchDelete}
            disabled={jobs.length === 0}
          />
        </div>
      )}

      <div className="overflow-x-auto" ref={parentRef}>
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              {showCheckbox && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={jobs.length > 0 && selectedJobIds.length === jobs.length}
                    onCheckedChange={handlers.handleSelectAll}
                    disabled={jobs.length === 0}
                    aria-label={t('job.selectAll')}
                  />
                </TableHead>
              )}
              <TableHead>{t('job.name')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('job.schedule')}</TableHead>
              <TableHead>{t('job.status')}</TableHead>
              {showLastRun && (
                <TableHead className="hidden md:table-cell">{t('job.lastRun')}</TableHead>
              )}
              {showNextRun && (
                <TableHead className="hidden md:table-cell">{t('job.nextRun')}</TableHead>
              )}
              <TableHead className="text-right">{t('job.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    (showCheckbox ? 1 : 0) +
                    3 +
                    (showLastRun ? 1 : 0) +
                    (showNextRun ? 1 : 0) +
                    1
                  }
                  className="text-center py-6 text-muted-foreground"
                >
                  {t('job.noJobs')}
                </TableCell>
              </TableRow>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const job = jobs[virtualRow.index];
                  return (
                    <div
                      key={job.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <MemoizedJobRow
                        job={job}
                        isSelected={selectedJobIds.includes(job.id)}
                        onSelect={handlers.handleSelectJob}
                        onViewDetails={handlers.handleViewDetails}
                        onToggleStatus={onToggleStatus}
                        onDeleteJob={onDeleteJob}
                        onDuplicateJob={onDuplicateJob}
                        onTriggerJob={onTriggerJob}
                        onEditJob={handlers.handleEdit}
                        showCheckbox={showCheckbox}
                        showLastRun={showLastRun}
                        showNextRun={showNextRun}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </TableBody>
        </Table>
      </div>
      {editModalJob && (
        <EditJobModal
          open={true}
          job={editModalJob}
          onClose={handlers.handleCloseEditModal}
          onSubmit={handlers.handleSubmitEdit}
        />
      )}
    </div>
  );
}
