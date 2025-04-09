
import { JobLog } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export interface LogListProps {
  logs: JobLog[];
  isLoading?: boolean;
}

export function LogList({ logs, isLoading = false }: LogListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">เวลา</TableHead>
            <TableHead className="w-1/6">สถานะ</TableHead>
            <TableHead>ข้อความ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                ไม่พบบันทึกการทำงาน
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const statusColors = {
                info: "blue",
                success: "green",
                warning: "yellow",
                error: "red",
              };
              
              return (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-xs text-muted-foreground">
                      {log.startTime ? dayjs(log.startTime).format("DD MMM YYYY - HH:mm:ss") : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.startTime ? dayjs(log.startTime).fromNow() : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === "error" ? "destructive" : "default"}
                      className={log.status !== "error" ? `bg-${statusColors[log.status]}-500` : ""}
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.output || "No output"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
