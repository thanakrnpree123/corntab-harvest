
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CronJob, JobStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditJobModalProps {
  open: boolean;
  job: CronJob | null;
  onClose: () => void;
  onSubmit: (updatedJob: CronJob) => void;
}

export function EditJobModal({ open, job, onClose, onSubmit }: EditJobModalProps) {
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState<JobStatus>("idle");

  useEffect(() => {
    if (job) {
      setName(job.name);
      setSchedule(job.schedule);
      setStatus(job.status);
    }
  }, [job]);

  // Reset the form when closed
  useEffect(() => {
    if (!open) {
      // Don't do anything - let the parent component manage state
      return;
    }
  }, [open]);

  const handleModalClose = () => {
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขงาน</DialogTitle>
          <DialogDescription>
            โปรดระบุข้อมูลที่ต้องการแก้ไขสำหรับงาน <b>{job.name}</b>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...job,
              name,
              schedule,
              status,
            });
          }}
        >
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="job-name" className="block mb-1 text-sm font-medium">ชื่องาน</label>
              <Input
                id="job-name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="job-schedule" className="block mb-1 text-sm font-medium">Cron Schedule</label>
              <Input
                id="job-schedule"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(value: JobStatus) => setStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleModalClose}>
              ยกเลิก
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
