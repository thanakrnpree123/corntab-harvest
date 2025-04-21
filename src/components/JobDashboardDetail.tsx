import { useState, useEffect, useRef } from "react";
import { CronJob } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogsDetail } from "@/components/LogsDetail";
import { 
  Clock, 
  Calendar, 
  Globe, 
  Server, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Pause, 
  RefreshCw,
  Code,
  Mail,
  Webhook,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { apiService } from "@/lib/api-service";
import dayjs from "dayjs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface JobDashboardDetailProps {
  job: CronJob;
  onRefresh: () => void;
}

export function JobDashboardDetail({ job, onRefresh }: JobDashboardDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRunJob = async () => {
    setIsLoading(true);
    setIsRunningNow(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "เริ่มรันงานแล้ว",
        description: `งาน "${job.name}" กำลังทำงาน`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      toast({
        title: "รันงานเสร็จสิ้น",
        description: `งาน "${job.name}" รันสำเร็จแล้ว`,
        variant: "default",
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถรันงาน: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRunningNow(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    
    try {
      const newStatus = job.status === "paused" ? "idle" : "paused";
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: newStatus === "paused" ? "งานถูกหยุดชั่วคราว" : "งานกลับมาทำงาน",
        description: newStatus === "paused" 
          ? `งาน "${job.name}" ถูกหยุดชั่วคราวแล้ว` 
          : `งาน "${job.name}" กลับมาทำงานแล้ว`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถเปลี่ยนสถานะงาน: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      if (logsRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = logsRef.current;
        const rowHeight = 48;
        const fiveRowsHeight = rowHeight * 5;
        
        if (scrollHeight > fiveRowsHeight) {
          setShowViewMore(true);
        } else {
          setShowViewMore(false);
        }
      }
    };

    const logsElement = logsRef.current;
    if (logsElement) {
      logsElement.addEventListener('scroll', checkScroll);
      checkScroll();
    }

    return () => {
      if (logsElement) {
        logsElement.removeEventListener('scroll', checkScroll);
      }
    };
  }, []);

  const handleViewMoreClick = () => {
    navigate(`/logs?jobId=${job.id}`);
  };

  return (
    <div className="space-y-6 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <Card className="bg-card flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{job.name}</CardTitle>
                <CardDescription>{job.description || "ไม่มีคำอธิบาย"}</CardDescription>
              </div>
              <StatusBadge status={isRunningNow ? "running" : job.status} size="lg" />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>ตารางเวลา</span>
                  </div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {job.schedule}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>Timezone</span>
                  </div>
                  <div>{job.timezone} {job.useLocalTime ? "(Local Time)" : ""}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Server className="w-4 h-4" />
                  <span>Endpoint</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono">{job.httpMethod}</Badge>
                  <span className="text-sm truncate">{job.endpoint}</span>
                </div>
              </div>

              {job.requestBody && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    <span>Request Body</span>
                  </div>
                  <div className="max-h-20 overflow-y-auto text-xs bg-muted px-2 py-1 rounded">
                    <pre>{job.requestBody}</pre>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>สำเร็จ</span>
                  </div>
                  <div>{job.successCount || 0} ครั้ง</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>ล้มเหลว</span>
                  </div>
                  <div>{job.failCount || 0} ครั้ง</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>รันล่าสุด</span>
                  </div>
                  <div>{job.lastRun ? dayjs(job.lastRun).format('dd/MM/yyyy HH:mm:ss') : "ไม่มีข้อมูล"}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>เวลาเฉลี่ย</span>
                  </div>
                  <div>{job.averageRuntime ? `${job.averageRuntime.toFixed(1)} วินาที` : "ไม่มีข้อมูล"}</div>
                </div>
              </div>

              {/* <div className="flex flex-wrap gap-2 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex-1"
                      disabled={isLoading || job.status === "running" || isRunningNow}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      รันตอนนี้
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>รันงานตอนนี้</AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณแน่ใจหรือไม่ที่จะรันงาน "{job.name}" ตอนนี้?
                        งานจะถูกรันทันทีโดยไม่คำนึงถึงตารางเวลา
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRunJob}>
                        รันตอนนี้
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={job.status === "paused" ? "default" : "outline"}
                      className="flex-1"
                      disabled={isLoading || job.status === "running" || isRunningNow}
                    >
                      {job.status === "paused" ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          เปิดใช้งาน
                        </>
                      ) : (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          หยุดชั่วคราว
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {job.status === "paused" ? "เปิดใช้งาน" : "หยุดงานชั่วคราว"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {job.status === "paused" 
                          ? `คุณแน่ใจหรือไม่ที่จะเปิดใช้งาน "${job.name}"? งานจะกลับมาทำงานตามตารางเวลาที่กำหนด` 
                          : `คุณแน่ใจหรือไม่ที่จะหยุด "${job.name}" ชั่วคราว? งานจะไม่รันจนกว่าคุณจะเปิดใช้งานอีกครั้ง`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={handleToggleStatus}>
                        {job.status === "paused" ? "เปิดใช้งาน" : "หยุดชั่วคราว"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div> */}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>ประวัติการทำงานล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 relative" ref={logsRef}>
            <LogsDetail jobId={job.id} />
            {showViewMore && (
              <div className="sticky bottom-0 w-full bg-gradient-to-t from-background to-transparent pt-4 pb-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleViewMoreClick}
                >
                  ดูเพิ่มเติม
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
