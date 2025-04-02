
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Project } from "@/lib/types";
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
import { CalendarIcon } from "lucide-react";
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
} from "@/components/ui/card";
import { LogsDetail } from "@/components/LogsDetail";

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
        if (!response.success) {
          toast({
            title: "ไม่สามารถโหลดรายการโปรเจคได้",
            description: response.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
            variant: "destructive",
          });
        }
        return [];
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการโปรเจคได้",
          variant: "destructive",
        });
        return [];
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
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      try {
        const response = await apiService.getJobsByProject(selectedProjectId);
        if (response.success && response.data) {
          return response.data;
        }
        if (!response.success) {
          toast({
            title: "ไม่สามารถโหลดรายการงานได้",
            description: response.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
            variant: "destructive",
          });
        }
        return [];
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการงานได้",
          variant: "destructive",
        });
        return [];
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
          <Select 
            value={selectedJobId} 
            onValueChange={setSelectedJobId} 
            disabled={!jobs.length || isLoadingJobs}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              {isLoadingJobs ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
        </div>

        {/* Log filtering options */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Status Filter */}
          <Select onValueChange={(value) => setLogsFilter(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="กรองตามสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ทั้งหมด</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
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
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
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

          {/* Search Filter */}
          <Input
            type="search"
            placeholder="ค้นหาในล็อก..."
            className="w-full md:w-[200px]"
            value={logsFilter.search}
            onChange={(e) => setLogsFilter(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        {/* Log display */}
        <Card>
          <CardContent className="p-4">
            {selectedJobId ? (
              <LogsDetail 
                jobId={selectedJobId} 
                jobName={jobs.find(job => job.id === selectedJobId)?.name}
              />
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
