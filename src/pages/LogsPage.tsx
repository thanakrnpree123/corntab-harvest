
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobLog, Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogsDetail } from "@/components/LogsDetail";
import { Badge } from "@/components/ui/badge";

interface LogsFilter {
  status: string;
  dateRange: [Date | null, Date | null] | null;
  search: string;
}

export default function LogsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [logsFilter, setLogsFilter] = useState<LogsFilter>({
    status: "",
    dateRange: null,
    search: ""
  });
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const { toast } = useToast();

  // Fetch projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          return response.data;
        }
        // ถ้าไม่สำเร็จ ให้ใช้ mock data
        return getMockProjects();
      } catch (error) {
        console.warn("Using mock projects due to API error:", error);
        return getMockProjects();
      }
    }
  });

  // Set default selected project when data is loaded
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch jobs for selected project
  const { 
    data: jobs = [], 
    isLoading: isLoadingJobs,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['jobs', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      try {
        const response = await apiService.getJobsByProject(selectedProjectId);
        if (response.success && response.data) {
          return response.data;
        }
        // ถ้าไม่สำเร็จ ให้ใช้ mock data
        return getMockJobs(selectedProjectId);
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getMockJobs(selectedProjectId);
      }
    },
    enabled: !!selectedProjectId
  });

  // Set default selected job when data is loaded
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    } else if (jobs && jobs.length === 0) {
      setSelectedJobId("");
    }
  }, [jobs, selectedJobId]);

  // Fetch logs for selected job
  const { 
    data: logs = [], 
    isLoading: isLoadingLogs,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['logs', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return [];
      
      try {
        const response = await apiService.getJobLogs(selectedJobId);
        if (response.success && response.data) {
          return response.data;
        }
        // ถ้าไม่สำเร็จ ให้ใช้ mock data
        return getMockLogs(selectedJobId);
      } catch (error) {
        console.warn("Using mock logs due to API error:", error);
        return getMockLogs(selectedJobId);
      }
    },
    enabled: !!selectedJobId
  });
  
  // Filter logs
  const filteredLogs = logs.filter((log: JobLog) => {
    // Status filter
    if (logsFilter.status && log.status !== logsFilter.status) {
      return false;
    }
    
    // Date range filter
    if (logsFilter.dateRange && logsFilter.dateRange[0] && logsFilter.dateRange[1]) {
      const logDate = new Date(log.startTime);
      const startDate = logsFilter.dateRange[0];
      const endDate = logsFilter.dateRange[1];
      
      // Set endDate to end of day
      endDate.setHours(23, 59, 59, 999);
      
      if (logDate < startDate || logDate > endDate) {
        return false;
      }
    }
    
    // Search filter
    if (logsFilter.search) {
      const searchLower = logsFilter.search.toLowerCase();
      const outputMatch = log.output?.toLowerCase().includes(searchLower);
      const errorMatch = log.error?.toLowerCase().includes(searchLower);
      
      if (!outputMatch && !errorMatch) {
        return false;
      }
    }
    
    return true;
  });

  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    apiService.createProject(projectData)
      .then(response => {
        if (response.success && response.data) {
          setSelectedProjectId(response.data.id);
          toast({
            title: "สร้างโปรเจคสำเร็จ",
            description: `โปรเจค "${projectData.name}" ถูกสร้างเรียบร้อยแล้ว`,
          });
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถสร้างโปรเจคได้: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถสร้างโปรเจคได้: ${error.message}`,
          variant: "destructive",
        });
      });
  };
  
  const handleRefreshLogs = () => {
    setIsRefreshingLogs(true);
    refetchLogs().then(() => {
      toast({
        title: "รีเฟรชข้อมูลสำเร็จ",
        description: "ข้อมูล logs ได้รับการอัปเดตเรียบร้อยแล้ว",
      });
      setTimeout(() => setIsRefreshingLogs(false), 500);
    }).catch(error => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถรีเฟรชข้อมูล: ${error.message}`,
        variant: "destructive",
      });
      setIsRefreshingLogs(false);
    });
  };
  
  const handleClearFilters = () => {
    setLogsFilter({
      status: "",
      dateRange: null,
      search: ""
    });
  };
  
  // Active filter count
  const activeFiltersCount = [
    logsFilter.status !== "",
    logsFilter.dateRange !== null,
    logsFilter.search !== ""
  ].filter(Boolean).length;

  return (
    <PageLayout title="ประวัติการทำงาน">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateProject={handleCreateProject}
            compact={true}
            isLoading={isLoadingProjects}
          />
          
          {/* Job selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select 
              value={selectedJobId} 
              onValueChange={setSelectedJobId} 
              disabled={!jobs.length || isLoadingJobs}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                {isLoadingJobs ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>กำลังโหลด...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="เลือกงาน" />
                )}
              </SelectTrigger>
              <SelectContent>
                {jobs.length > 0 ? jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.name}
                  </SelectItem>
                )) : (
                  <div className="p-2 text-center text-muted-foreground">
                    ไม่พบงานในโปรเจคนี้
                  </div>
                )}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefreshLogs} 
              disabled={isRefreshingLogs || !selectedJobId}
            >
              <RefreshCcw className={cn("h-4 w-4", isRefreshingLogs && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Log filtering options */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex-1 min-w-[150px]">
            <Select 
              value={logsFilter.status} 
              onValueChange={(value) => setLogsFilter(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="กรองตามสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทั้งหมด</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex-1 min-w-[240px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !logsFilter.dateRange ? "text-muted-foreground" : undefined
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {logsFilter.dateRange && logsFilter.dateRange[0] && logsFilter.dateRange[1] ? (
                    logsFilter.dateRange[0]?.toLocaleDateString() === logsFilter.dateRange[1]?.toLocaleDateString() ? (
                      format(logsFilter.dateRange[0], "PPP")
                    ) : (
                      `${format(logsFilter.dateRange[0], "PPP")} - ${format(logsFilter.dateRange[1], "PPP")}`
                    )
                  ) : (
                    <span>เลือกช่วงวันที่</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                  mode="range"
                  defaultMonth={logsFilter.dateRange && logsFilter.dateRange[0] ? logsFilter.dateRange[0] : new Date()}
                  selected={{
                    from: logsFilter.dateRange ? logsFilter.dateRange[0] : undefined,
                    to: logsFilter.dateRange ? logsFilter.dateRange[1] : undefined
                  }}
                  onSelect={(date) => setLogsFilter(prev => ({ 
                    ...prev, 
                    dateRange: date ? [date.from, date.to] as [Date | null, Date | null] : null 
                  }))}
                  numberOfMonths={2}
                  pagedNavigation
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Filter */}
          <div className="flex-1 min-w-[200px]">
            <Input
              type="search"
              placeholder="ค้นหาในล็อก..."
              value={logsFilter.search}
              onChange={(e) => setLogsFilter(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          {/* Clear filters button */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={handleClearFilters} size="sm">
              ล้างตัวกรอง ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Log display */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center justify-between">
              <span>
                {jobs.find(job => job.id === selectedJobId)?.name 
                  ? `ประวัติการทำงาน: ${jobs.find(job => job.id === selectedJobId)?.name}` 
                  : "ประวัติการทำงาน"}
              </span>
              <Badge variant={isRefreshingLogs ? "outline" : "secondary"}>
                {isLoadingLogs || isRefreshingLogs ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> กำลังโหลด...
                  </span>
                ) : (
                  `${filteredLogs.length} รายการ`
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedJobId ? (
              filteredLogs.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {filteredLogs.map((log: JobLog) => (
                      <Card key={log.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-0">
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={
                                log.status === "success" ? "success" :
                                log.status === "failed" ? "destructive" :
                                "outline"
                              }
                              className={cn(
                                "px-2 py-0 h-6 capitalize",
                                log.status === "success" && "bg-emerald-500 hover:bg-emerald-600",
                                log.status === "failed" && "bg-rose-500 hover:bg-rose-600"
                              )}
                            >
                              {log.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {new Date(log.startTime).toLocaleString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-2">
                            {log.duration !== null && (
                              <div className="text-sm">
                                <span className="font-medium">ใช้เวลา: </span>
                                {log.duration < 1000 ? 
                                  `${log.duration} ms` : 
                                  `${(log.duration / 1000).toFixed(2)} วินาที`}
                              </div>
                            )}
                            
                            {log.output && (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">ผลลัพธ์:</div>
                                <div className="bg-muted p-2 rounded-md overflow-x-auto max-h-20 text-sm">
                                  <pre className="whitespace-pre-wrap">{log.output}</pre>
                                </div>
                              </div>
                            )}
                            
                            {log.error && (
                              <div className="space-y-1">
                                <div className="font-medium text-sm text-destructive">ข้อผิดพลาด:</div>
                                <div className="bg-destructive/10 p-2 rounded-md overflow-x-auto max-h-20 text-sm text-destructive">
                                  <pre className="whitespace-pre-wrap">{log.error}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {filteredLogs.length < logs.length && (
                    <div className="text-center text-sm text-muted-foreground">
                      แสดง {filteredLogs.length} รายการจากทั้งหมด {logs.length} รายการ
                      {activeFiltersCount > 0 && " (มีการใช้ตัวกรอง)"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  {activeFiltersCount > 0 ? (
                    <div className="text-center">
                      <p className="mb-2 text-muted-foreground">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                      <Button variant="secondary" size="sm" onClick={handleClearFilters}>ล้างตัวกรอง</Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">ยังไม่มีประวัติการทำงานสำหรับงานนี้</p>
                  )}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center p-8">
                <span className="text-muted-foreground">เลือกงานเพื่อดูประวัติการทำงาน</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

// Mock functions for UI testing

function getMockProjects(): Project[] {
  return [
    {
      id: "project-1",
      name: "Marketing Automation",
      description: "Marketing campaign automation tasks",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "project-2",
      name: "Data Sync",
      description: "Database synchronization jobs",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "project-3",
      name: "Reporting",
      description: "Automated reporting tasks",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

function getMockJobs(projectId: string) {
  return [
    {
      id: "job-1",
      name: "Send Weekly Newsletter",
      schedule: "0 9 * * 1",
      endpoint: "https://api.example.com/send-newsletter",
      httpMethod: "POST",
      description: "Sends weekly newsletter to subscribers every Monday",
      status: "idle" as const,
      useLocalTime: false,
      timezone: "UTC",
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(Date.now() + 518400000).toISOString(),
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      tags: ["marketing", "email"],
      successCount: 12,
      failCount: 1,
      averageRuntime: 45.2,
      projectId: "project-1",
      emailNotifications: "admin@example.com,notify@example.com",
      webhookUrl: "https://hooks.slack.com/services/XXX/YYY/ZZZ"
    },
    {
      id: "job-2",
      name: "Database Backup",
      schedule: "0 0 * * *",
      endpoint: "https://api.example.com/backup",
      httpMethod: "GET",
      description: "Daily database backup at midnight",
      status: "success" as const,
      useLocalTime: true,
      timezone: "Asia/Bangkok",
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 82800000).toISOString(),
      createdAt: new Date(Date.now() - 7776000000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      tags: ["database", "backup"],
      successCount: 89,
      failCount: 3,
      averageRuntime: 134.7,
      projectId: "project-2",
      emailNotifications: null,
      webhookUrl: null
    },
  ].filter(job => job.projectId === projectId);
}

function getMockLogs(jobId: string): JobLog[] {
  // สร้าง logs ย้อนหลังไปสัก 10 วัน โดยสุ่มระหว่าง success และ failed
  const logs = [];
  const statuses = ["success", "failed", "running"];
  const baseTime = Date.now();
  
  for (let i = 0; i < 20; i++) {
    const startTime = new Date(baseTime - (i * 12 * 3600000));
    const status = statuses[Math.floor(Math.random() * (i === 0 ? 3 : 2))]; // ให้รายการล่าสุดมีโอกาสเป็น running
    const duration = status === "running" ? null : Math.floor(Math.random() * 60000) + 1000;
    const endTime = duration ? new Date(startTime.getTime() + duration) : null;
    
    let output = "";
    let error = null;
    
    if (status === "success") {
      output = `Task completed successfully in ${duration / 1000} seconds.\nProcessed 1,240 records.\nSent 4 notifications.`;
    } else if (status === "running") {
      output = "Task is currently running...";
    } else {
      output = "Started task execution...";
      error = `Error: Failed to connect to external API.\nHTTP Status: 500\nResponse: {"error": "Internal Server Error"}\nStack: TypeError: Cannot read property 'data' of undefined\n    at processResponse (app.js:123)\n    at handleRequest (app.js:45)`;
    }
    
    logs.push({
      id: `log-${jobId}-${i}`,
      jobId,
      status,
      startTime: startTime.toISOString(),
      endTime: endTime?.toISOString() || null,
      duration,
      output,
      error,
      createdAt: startTime.toISOString(),
    });
  }
  
  return logs;
}
