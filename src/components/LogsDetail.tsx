
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api-service";
import { JobLog } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { LogList } from "@/components/LogList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogsDetailProps {
  jobId: string;
  jobName?: string;
}

export function LogsDetail({ jobId, jobName }: LogsDetailProps) {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    if (!jobId) return;

    setIsLoading(true);
    try {
      const response = await apiService.getJobLogs(jobId);
      
      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        toast({
          title: "ไม่สามารถโหลดข้อมูลล็อกได้",
          description: response.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองใหม่อีกครั้ง",
          variant: "error", // Changed from "destructive" to "error"
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลล็อกได้ โปรดลองใหม่อีกครั้ง",
        variant: "error", // Changed from "destructive" to "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch logs when job ID changes
  useEffect(() => {
    fetchLogs();
    
    // Clean up any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Set up auto-refresh every 30 seconds
    const interval = window.setInterval(() => {
      fetchLogs();
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [jobId]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          {jobName ? `ประวัติการทำงาน: ${jobName}` : "ประวัติการทำงาน"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LogList logs={logs} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
