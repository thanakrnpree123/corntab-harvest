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
import { useEffect, useState } from "react";
import { BatchJobsActions } from "./BatchJobsActions";
import { JobRowDisplay } from "./JobRowDisplay";
import { toast } from "@/components/ui/use-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from 'react-i18next';

dayjs.extend(relativeTime);

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
      setSelectedJobIds(jobs.map((job) => job.id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds((prev) => [...prev, jobId]);
    } else {
      setSelectedJobIds((prev) => prev.filter((id) => id !== jobId));
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

  const handleEdit = (job: CronJob) => {
    setEditModalJob(job);
  };

  const handleCloseEditModal = () => {
    setEditModalJob(null);
  };

  const handleSubmitEdit = (updatedJob: CronJob) => {
    if (onEditJob) onEditJob(updatedJob);
    setEditModalJob(null);

    toast({
      title: "บันทึกงานเรียบร้อย",
      description: `งาน "${updatedJob.name}" แก้ไขข้อมูลสำเร็จ`,
    });
  };

  const showCheckbox = !!(onExportJobs || onBatchDeleteJobs);

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
              {showCheckbox && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      jobs.length > 0 && selectedJobIds.length === jobs.length
                    }
                    onCheckedChange={handleSelectAll}
                    disabled={jobs.length === 0}
                    aria-label="Select all jobs"
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
              jobs.map((job) => (
                <JobRowDisplay
                  key={job.id}
                  job={job}
                  isSelected={selectedJobIds.includes(job.id)}
                  onSelect={handleSelectJob}
                  onViewDetails={handleViewDetails}
                  onToggleStatus={onToggleStatus}
                  onDeleteJob={onDeleteJob}
                  onDuplicateJob={onDuplicateJob}
                  onTriggerJob={onTriggerJob}
                  onEditJob={handleEdit}
                  showCheckbox={showCheckbox}
                  showLastRun={showLastRun}
                  showNextRun={showNextRun}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {editModalJob && (
        <EditJobModal
          open={true}
          job={editModalJob}
          onClose={handleCloseEditModal}
          onSubmit={handleSubmitEdit}
        />
      )}
    </div>
  );
}
