
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
import { toast } from "@/hooks/use-toast";

interface ProjectJobsListProps {
  jobs: CronJob[];
  isLoading: boolean;
  onViewJobDetails: (job: CronJob) => void;
}

export function ProjectJobsList({
  jobs,
  isLoading,
  onViewJobDetails,
}: ProjectJobsListProps) {
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm py-4 text-center">
        กำลังโหลดรายการงาน...
      </p>
    );
  }
  
  if (jobs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4 text-center">
        ไม่พบงานในโปรเจคนี้
      </p>
    );
  }
  
  return (
    <div className="max-h-[400px] overflow-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%] truncate">
              ชื่องาน
            </TableHead>
            <TableHead className="hidden md:table-cell w-[25%] truncate">
              ตารางเวลา
            </TableHead>
            <TableHead className="w-[15%] truncate">
              สถานะ
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => {
                onViewJobDetails(job);
                toast({
                  title: "ดูรายละเอียดงาน",
                  description: `กำลังดูรายละเอียดของงาน "${job.name}"`,
                });
              }}
            >
              <TableCell>
                <div className="font-medium truncate">
                  {job.name}
                </div>
                <div className="text-xs text-muted-foreground md:hidden">
                  {job.schedule}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <code className="bg-muted text-xs px-1 py-0.5 rounded">
                  {job.schedule}
                </code>
              </TableCell>
              <TableCell>
                <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  <StatusBadge status={job.status} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
