
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
import { CronJob } from "@/lib/types";

interface EditJobModalProps {
  open: boolean;
  job: CronJob | null;
  onClose: () => void;
  onSubmit: (updatedJob: CronJob) => void;
}

export function EditJobModal({ open, job, onClose, onSubmit }: EditJobModalProps) {
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState<CronJob["status"]>("active");

  useEffect(() => {
    if (job) {
      setName(job.name);
      setSchedule(job.schedule);
      setStatus(job.status);
    }
  }, [job]);

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              <select
                className="w-full border rounded px-2 py-1"
                value={status}
                onChange={e => setStatus(e.target.value as CronJob["status"])}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
