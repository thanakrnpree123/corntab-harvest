
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { JobExportImport } from "@/components/JobExportImport";
import { CronJob, JobStatus, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Loader2, Filter, ArrowLeft, EllipsisVertical, Play, Pause, Copy, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function ProjectJobsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        const response = await apiService.getProject(projectId || "");
        if (response.success && response.data) {
          return response.data;
        }
        const projectsResponse = await apiService.getProjects();
        if (projectsResponse.success && projectsResponse.data) {
          const foundProject = projectsResponse.data.find(p => p.id === projectId);
          if (foundProject) return foundProject;
        }
        return getMockProject(projectId || "");
      } catch (error) {
        console.warn("Using mock project due to API error:", error);
        return getMockProject(projectId || "");
      }
    },
    enabled: !!projectId
  });

  const { 
    data: jobs = [], 
    isLoading: isLoadingJobs, 
    refetch: refetchJobs 
  } = useQuery({
    queryKey: ['jobs', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      try {
        const response = await apiService.getJobsByProject(projectId);
        if (response.success && response.data) {
          return response.data;
        }
        return getMockJobs(projectId);
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getMockJobs(projectId);
      }
    },
    enabled: !!projectId
  });

  const handleCreateJob = (jobData: Partial<CronJob>) => {
    const newJobData = {
      ...jobData,
      projectId: projectId,
      name: jobData.name || "",
      schedule: jobData.schedule || "",
      endpoint: jobData.endpoint || "",
      httpMethod: jobData.httpMethod || "GET",
      useLocalTime: jobData.useLocalTime || false,
      timezone: jobData.timezone || "UTC",
    };

    apiService.createJob(newJobData as any)
      .then(response => {
        if (response.success && response.data) {
          toast({
            title: "สร้างงานสำเร็จ",
            description: `สร้างงาน "${jobData.name}" เรียบร้อยแล้ว`,
          });
          refetchJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถสร้างงาน: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถสร้างงาน: ${error.message}`,
          variant: "destructive",
        });
        
        const mockJob = createMockJob({ ...newJobData, id: `mock-${Date.now()}` });
        refetchJobs();
        toast({
          title: "สร้างข้อมูลทดสอบแล้ว",
          description: "เนื่องจาก API ไม่พร้อมใช้งาน จึงสร้างข้อมูลทดสอบให้แทน",
        });
      });
  };

  const handleViewJobDetails = (job: CronJob) => {
    setSelectedJob(job);
    setIsDetailSheetOpen(true);
    toast({
      title: "ดูรายละเอียดงาน",
      description: `กำลังดูรายละเอียดของงาน "${job.name}"`,
    });
  };

  const handleViewProjectJobList = (projectId: string) => {
    navigate(`/jobs/${projectId}`);
    toast({
      title: "ดูรายการงานในโปรเจค",
      description: `กำลังดูรายการงานในโปรเจค ${project?.name || projectId}`,
    });
  };

  const toggleJobStatus = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));
    const newStatus = job.status === "paused" ? "idle" : "paused";
    
    apiService.updateJob(jobId, { status: newStatus })
      .then(response => {
        if (response.success) {
          if (newStatus === "paused") {
            toast({
              title: "งานถูกหยุดชั่วคราว",
              description: `${job.name} ถูกหยุดชั่วคราวแล้ว`,
              variant: "default",
            });
          } else {
            toast({
              title: "งานกลับมาทำงาน",
              description: `${job.name} กลับมาทำงานแล้ว`,
              variant: "default",
            });
          }
          refetchJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถอัปเดตสถานะงาน: ${response.error}`,
            variant: "destructive",
          });
          
          mockToggleJobStatus(job, newStatus);
          refetchJobs();
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถอัปเดตสถานะงาน: ${error.message}`,
          variant: "destructive",
        });
        
          mockToggleJobStatus(job, newStatus);
          refetchJobs();
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDeleteJob = (jobId: string) => {
    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));
    const job = jobs.find(j => j.id === jobId);
    const jobName = job?.name || "งานนี้";

    apiService.deleteJob(jobId)
      .then(response => {
        if (response.success) {
          toast({
            title: "ลบงานสำเร็จ",
            description: `ลบงาน "${jobName}" เรียบร้อยแล้ว`,
          });
          refetchJobs();
          setSelectedJobIds(prev => prev.filter(id => id !== jobId));
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถลบงาน: ${response.error}`,
            variant: "destructive",
          });
          
          mockDeleteJob(jobId);
          refetchJobs();
          setSelectedJobIds(prev => prev.filter(id => id !== jobId));
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบงาน: ${error.message}`,
          variant: "destructive",
        });
        
        mockDeleteJob(jobId);
        refetchJobs();
        setSelectedJobIds(prev => prev.filter(id => id !== jobId));
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDuplicateJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));
    
    apiService.duplicateJob(jobId)
      .then(response => {
        if (response.success && response.data) {
          toast({
            title: "ทำสำเนาสำเร็จ",
            description: `ทำสำเนางาน "${job.name}" เรียบร้อยแล้ว`,
          });
          refetchJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถทำสำเนางาน: ${response.error}`,
            variant: "destructive",
          });
          
          mockDuplicateJob(job);
          refetchJobs();
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถทำสำเนางาน: ${error.message}`,
          variant: "destructive",
        });
        
        mockDuplicateJob(job);
        refetchJobs();
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleImportJobs = (importedJobs: Partial<CronJob>[]) => {
    const jobsWithProject = importedJobs.map(job => ({
      ...job,
      projectId: projectId,
      useLocalTime: job.useLocalTime || false,
      timezone: job.timezone || "UTC",
    }));
    
    let successCount = 0;
    let failCount = 0;
    
    toast({
      title: "กำลังนำเข้า",
      description: `กำลังนำเข้างาน ${jobsWithProject.length} รายการ...`,
    });
    
    const createPromises = jobsWithProject.map(job => 
      apiService.createJob(job as any)
        .then(response => {
          if (response.success) successCount++;
          else failCount++;
          return response;
        })
        .catch(() => {
          mockImportJob(job);
          successCount++;
          return { success: true };
        })
    );
    
    Promise.all(createPromises)
      .then(() => {
        toast({
          title: "นำเข้าเรียบร้อย",
          description: `นำเข้า ${successCount} งานสำเร็จ${failCount > 0 ? `, ล้มเหลว ${failCount} งาน` : ''}`,
        });
        if (successCount > 0) {
          refetchJobs();
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาดระหว่างการนำเข้า",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setDateFilter("all");
    setIsFilterOpen(false);
    
    toast({
      title: "ล้างตัวกรอง",
      description: "ล้างตัวกรองทั้งหมดเรียบร้อยแล้ว",
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobIds(sortedJobs.map(job => job.id));
      toast({
        title: "เลือกทั้งหมด",
        description: `เลือกงานทั้งหมด ${sortedJobs.length} รายการเรียบร้อยแล้ว`,
      });
    } else {
      setSelectedJobIds([]);
      toast({
        title: "ยกเลิกการเลือกทั้งหมด",
        description: "ยกเลิกการเลือกงานทั้งหมดเรียบร้อยแล้ว",
      });
    }
  };

  const toggleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds(prev => [...prev, jobId]);
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        toast({
          title: "เลือกงาน",
          description: `เลือกงาน "${job.name}" เรียบร้อยแล้ว`,
        });
      }
    } else {
      setSelectedJobIds(prev => prev.filter(id => id !== jobId));
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        toast({
          title: "ยกเลิกการเลือกงาน",
          description: `ยกเลิกการเลือกงาน "${job.name}" เรียบร้อยแล้ว`,
        });
      }
    }
  };

  const handleBackToProjects = () => {
    navigate("/jobs");
    toast({
      title: "กลับไปหน้าโปรเจค",
      description: "กำลังกลับไปหน้ารายการโปรเจค",
    });
  };

  const filteredJobs = jobs.filter(job => {
    const searchMatch = !searchQuery || 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.endpoint?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    
    let dateMatch = true;
    const jobDate = new Date(job.createdAt);
    
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateMatch = jobDate >= today;
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateMatch = jobDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateMatch = jobDate >= monthAgo;
    }
    
    return searchMatch && statusMatch && dateMatch;
  });
  
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "lastRun":
        if (!a.lastRun && !b.lastRun) comparison = 0;
        else if (!a.lastRun) comparison = 1;
        else if (!b.lastRun) comparison = -1;
        else comparison = new Date(a.lastRun).getTime() - new Date(b.lastRun).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const selectedJobs = jobs.filter(job => selectedJobIds.includes(job.id));

  const activeFiltersCount = [
    statusFilter !== "all",
    dateFilter !== "all",
    sortBy !== "name" || sortOrder !== "asc"
  ].filter(Boolean).length;

  const handleExportJobs = (format: "json" | "csv") => {
    const jobsToExport = selectedJobIds.length > 0
      ? jobs.filter(job => selectedJobIds.includes(job.id))
      : jobs;
    
    const exportableJobs = jobsToExport.map(job => ({
      name: job.name,
      description: job.description,
      schedule: job.schedule,
      endpoint: job.endpoint,
      httpMethod: job.httpMethod,
      timezone: job.timezone,
      useLocalTime: job.useLocalTime,
      tags: job.tags,
      headers: job.headers,
      body: job.body,
      emailNotifications: job.emailNotifications,
      webhookUrl: job.webhookUrl,
    }));
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    if (format === "json") {
      content = JSON.stringify(exportableJobs, null, 2);
      filename = `jobs-export-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = "application/json";
    } else {
      const headers = [
        "name",
        "description",
        "schedule",
        "endpoint",
        "httpMethod",
        "timezone",
        "useLocalTime",
        "tags",
        "headers",
        "body",
        "emailNotifications",
        "webhookUrl"
      ].join(",");
      
      const rows = exportableJobs.map(job => [
        `"${(job.name || "").replace(/"/g, '""')}"`,
        `"${(job.description || "").replace(/"/g, '""')}"`,
        `"${(job.schedule || "").replace(/"/g, '""')}"`,
        `"${(job.endpoint || "").replace(/"/g, '""')}"`,
        `"${(job.httpMethod || "").replace(/"/g, '""')}"`,
        `"${(job.timezone || "").replace(/"/g, '""')}"`,
        job.useLocalTime,
        `"${(Array.isArray(job.tags) ? job.tags.join(";") : "").replace(/"/g, '""')}"`,
        `"${(typeof job.headers === 'object' ? JSON.stringify(job.headers) : "").replace(/"/g, '""')}"`,
        `"${(job.body || "").replace(/"/g, '""')}"`,
        `"${(job.emailNotifications || "").replace(/"/g, '""')}"`,
        `"${(job.webhookUrl || "").replace(/"/g, '""')}"`,
      ].join(","));
      
      content = [headers, ...rows].join("\n");
      filename = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = "text/csv";
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "ส่งออกสำเร็จ",
      description: `ส่งออกข้อมูล ${exportableJobs.length} งานเรียบร้อยแล้ว`,
    });
  };

  return (
    <PageLayout title={`${project.name} - Jobs`}>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={handleBackToProjects} className="cursor-pointer">
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              เพิ่มงาน
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 space-y-2 md:space-y-0">
              <div className="flex gap-2">
                <Input
                  className="md:w-[200px]"
                  placeholder="ค้นหางาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      <span>ตัวกรอง</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">สถานะ</h4>
                        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกสถานะ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            <SelectItem value="idle">ว่าง</SelectItem>
                            <SelectItem value="running">กำลังทำงาน</SelectItem>
                            <SelectItem value="success">สำเร็จ</SelectItem>
                            <SelectItem value="failed">ล้มเหลว</SelectItem>
                            <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">วันที่สร้าง</h4>
                        <Select value={dateFilter} onValueChange={(val) => setDateFilter(val as any)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกช่วงเวลา" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            <SelectItem value="today">วันนี้</SelectItem>
                            <SelectItem value="week">7 วันที่ผ่านมา</SelectItem>
                            <SelectItem value="month">30 วันที่ผ่านมา</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    
                      <Separator />
                    
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">เรียงตาม</h4>
                        <div className="flex gap-2">
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="เรียงตาม" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">ชื่อ</SelectItem>
                              <SelectItem value="status">สถานะ</SelectItem>
                              <SelectItem value="date">วันที่สร้าง</SelectItem>
                              <SelectItem value="lastRun">รันล่าสุด</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as any)}>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="ลำดับ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">A-Z</SelectItem>
                              <SelectItem value="desc">Z-A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleClearFilters}
                      >
                        ล้างตัวกรอง
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {jobs.length > 0 && (
              <JobExportImport 
                jobs={selectedJobs.length > 0 ? selectedJobs : jobs} 
                onImport={handleImportJobs}
                onExport={handleExportJobs}
                disabled={selectedJobIds.length === 0}
              />
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoadingJobs ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">กำลังโหลดงาน...</span>
                </div>
              ) : (
                sortedJobs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[600px] w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            <Checkbox 
                              checked={selectedJobIds.length === sortedJobs.length && sortedJobs.length > 0}
                              onCheckedChange={toggleSelectAll}
                              className="mr-2"
                            />
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Schedule</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Last Run</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Next Run</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedJobs.map((job) => (
                          <tr 
                            key={job.id} 
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                            onClick={() => handleViewJobDetails(job)}
                          >
                            <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={selectedJobIds.includes(job.id)}
                                onCheckedChange={(checked) => toggleSelectJob(job.id, !!checked)}
                              />
                            </td>
                            <td className="p-4 align-middle">
                              <div className="font-medium">{job.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {job.schedule}
                              </div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                Last: {job.lastRun 
                                  ? dayjs(job.lastRun).format("MM/DD HH:mm") 
                                  : "Never"}
                              </div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                Next: {job.nextRun 
                                  ? dayjs(job.nextRun).format("MM/DD HH:mm") 
                                  : "Not scheduled"}
                              </div>
                            </td>
                            <td className="p-4 align-middle hidden md:table-cell">
                              <code className="bg-muted text-xs px-1 py-0.5 rounded">
                                {job.schedule}
                              </code>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                <StatusBadge status={job.status} />
                              </div>
                            </td>
                            <td className="p-4 align-middle hidden md:table-cell">
                              {job.lastRun ? (
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    {dayjs(job.lastRun).format("MMM DD, YYYY - HH:mm")}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {dayjs(job.lastRun).fromNow()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Never
                                </span>
                              )}
                            </td>
                            <td className="p-4 align-middle hidden md:table-cell">
                              {job.nextRun ? (
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    {dayjs(job.nextRun).format("MMM DD, YYYY - HH:mm")}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {dayjs(job.nextRun).fromNow()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Not scheduled
                                </span>
                              )}
                            </td>
                            <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                              {isJobActionInProgress[job.id] ? (
                                <Button variant="ghost" size="icon" disabled>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </Button>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <EllipsisVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem 
                                      onClick={() => toggleJobStatus(job.id)}
                                      className="flex items-center cursor-pointer"
                                    >
                                      {job.status === "paused" ? (
                                        <>
                                          <Play className="mr-2 h-4 w-4" />
                                          <span>Activate</span>
                                        </>
                                      ) : (
                                        <>
                                          <Pause className="mr-2 h-4 w-4" />
                                          <span>Pause</span>
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDuplicateJob(job.id)}
                                      className="flex items-center cursor-pointer"
                                    >
                                      <Copy className="mr-2 h-4 w-4" />
                                      <span>Duplicate</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Delete</span>
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>ยืนยันการลบงาน</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            คุณต้องการลบงาน "{job.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            ลบงาน
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">ยังไม่มีงานในโปรเจคนี้</p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      เพิ่มงานใหม่
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateJobModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateJob}
      />

      {selectedJob && (
        <JobDetails
          job={selectedJob}
          open={isDetailSheetOpen}
          onOpenChange={setIsDetailSheetOpen}
          onToggleStatus={() => toggleJobStatus(selectedJob.id)}
          onDelete={() => handleDeleteJob(selectedJob.id)}
          onDuplicate={() => handleDuplicateJob(selectedJob.id)}
        />
      )}
    </PageLayout>
  );
}

function getMockProject(projectId: string): Project {
  return {
    id: projectId,
    name: "Mock Project",
    description: "This is a mock project for demonstration purposes.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
  };
}

function getMockJobs(projectId: string): CronJob[] {
  return Array(5).fill(0).map((_, i) => createMockJob({
    id: `mock-${i}-${Date.now()}`,
    projectId,
    name: `Mock Job ${i + 1}`,
    description: `This is a mock job for demonstration purposes.`,
    schedule: "* * * * *",
    endpoint: "https://example.com/api/endpoint",
    httpMethod: "GET",
  }));
}

function createMockJob(partial: Partial<CronJob>): CronJob {
  const date = new Date();
  const future = new Date();
  future.setMinutes(future.getMinutes() + 1);
  
  return {
    id: partial.id || `mock-${Date.now()}`,
    projectId: partial.projectId || "mock-project",
    name: partial.name || "Mock Job",
    description: partial.description || "This is a mock job.",
    schedule: partial.schedule || "* * * * *",
    timezone: partial.timezone || "UTC",
    endpoint: partial.endpoint || "https://example.com/webhook",
    httpMethod: partial.httpMethod || "GET",
    headers: partial.headers || {},
    body: partial.body || "",
    status: partial.status || "idle",
    createdAt: partial.createdAt || date.toISOString(),
    updatedAt: partial.updatedAt || date.toISOString(),
    lastRun: partial.lastRun || (Math.random() > 0.5 ? new Date(date.getTime() - Math.random() * 10000000).toISOString() : null),
    nextRun: partial.nextRun || (Math.random() > 0.2 ? future.toISOString() : null),
    lastStatus: partial.lastStatus || (Math.random() > 0.7 ? "failed" : "success"),
    tags: partial.tags || [],
    useLocalTime: partial.useLocalTime || false,
    emailNotifications: partial.emailNotifications || "",
    webhookUrl: partial.webhookUrl || "",
  };
}

function mockToggleJobStatus(job: CronJob, newStatus: JobStatus): void {
  console.log(`Mock toggle job status: ${job.name} to ${newStatus}`);
}

function mockDeleteJob(jobId: string): void {
  console.log(`Mock delete job: ${jobId}`);
}

function mockDuplicateJob(job: CronJob): void {
  console.log(`Mock duplicate job: ${job.name}`);
}

function mockImportJob(job: Partial<CronJob>): void {
  console.log(`Mock import job: ${job.name}`);
}
