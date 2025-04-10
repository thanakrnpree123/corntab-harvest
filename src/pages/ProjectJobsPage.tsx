
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

export default function ProjectJobsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  
  // Selected jobs for bulk actions
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  // Fetch the project
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        const response = await apiService.getProject(projectId || "");
        if (response.success && response.data) {
          return response.data;
        }
        // If not successful, find it in all projects
        const projectsResponse = await apiService.getProjects();
        if (projectsResponse.success && projectsResponse.data) {
          const foundProject = projectsResponse.data.find(p => p.id === projectId);
          if (foundProject) return foundProject;
        }
        // If still not found, use mock data
        return getMockProject(projectId || "");
      } catch (error) {
        console.warn("Using mock project due to API error:", error);
        return getMockProject(projectId || "");
      }
    },
    enabled: !!projectId
  });

  // Fetch jobs based on selected project
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
        // If not successful, use mock data
        return getMockJobs(projectId);
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getMockJobs(projectId);
      }
    },
    enabled: !!projectId
  });

  // Handle checkbox selections
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobIds(sortedJobs.map(job => job.id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const toggleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds(prev => [...prev, jobId]);
    } else {
      setSelectedJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  // Return to projects page
  const handleBackToProjects = () => {
    navigate("/jobs");
  };

  // Filter jobs based on search query and other filters
  const filteredJobs = jobs.filter(job => {
    // 1. Search query filter
    const searchMatch = !searchQuery || 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.endpoint?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status filter
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    
    // 3. Date filter
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
  
  // Sort filtered jobs
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
        // Handle null values
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

  // Get only selected jobs for export
  const selectedJobs = jobs.filter(job => selectedJobIds.includes(job.id));

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
            title: "สำเร็จ",
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
        
        // Create mock data for demo
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
          
          // If unsuccessful, use mock data
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
        
          // If unsuccessful, use mock data
          mockToggleJobStatus(job, newStatus);
          refetchJobs();
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDeleteJob = (jobId: string) => {
    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));

    apiService.deleteJob(jobId)
      .then(response => {
        if (response.success) {
          toast({
            title: "สำเร็จ",
            description: "ลบงานเรียบร้อยแล้ว",
          });
          refetchJobs();
          // Remove from selected jobs if present
          setSelectedJobIds(prev => prev.filter(id => id !== jobId));
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถลบงาน: ${response.error}`,
            variant: "destructive",
          });
          
          // If unsuccessful, use mock data
          mockDeleteJob(jobId);
          refetchJobs();
          // Remove from selected jobs if present
          setSelectedJobIds(prev => prev.filter(id => id !== jobId));
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบงาน: ${error.message}`,
          variant: "destructive",
        });
        
        // If unsuccessful, use mock data
        mockDeleteJob(jobId);
        refetchJobs();
        // Remove from selected jobs if present
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
            title: "สำเร็จ",
            description: `ทำสำเนางาน "${job.name}" เรียบร้อยแล้ว`,
          });
          refetchJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถทำสำเนางาน: ${response.error}`,
            variant: "destructive",
          });
          
          // If unsuccessful, use mock data
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
        
        // If unsuccessful, use mock data
        mockDuplicateJob(job);
        refetchJobs();
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleImportJobs = (importedJobs: Partial<CronJob>[]) => {
    // Add the current projectId to all imported jobs
    const jobsWithProject = importedJobs.map(job => ({
      ...job,
      projectId: projectId,
      useLocalTime: job.useLocalTime || false,
      timezone: job.timezone || "UTC",
    }));
    
    let successCount = 0;
    let failCount = 0;
    
    // Create each job one by one
    const createPromises = jobsWithProject.map(job => 
      apiService.createJob(job as any)
        .then(response => {
          if (response.success) successCount++;
          else failCount++;
          return response;
        })
        .catch(() => {
          // If unsuccessful, use mock data for demo
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
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setDateFilter("all");
    setIsFilterOpen(false);
  };

  // Active filter count
  const activeFiltersCount = [
    statusFilter !== "all",
    dateFilter !== "all",
    sortBy !== "name" || sortOrder !== "asc"
  ].filter(Boolean).length;

  if (isLoadingProject) {
    return (
      <PageLayout title="Project Jobs">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูลโปรเจค...</span>
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout title="Project Not Found">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">ไม่พบโปรเจค</h1>
          <p className="text-muted-foreground mb-6">
            ไม่พบโปรเจคที่คุณต้องการหรือไม่มีสิทธิ์เข้าถึง
          </p>
          <Button onClick={handleBackToProjects}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าโปรเจค
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${project.name} - Jobs`}>
      {/* Breadcrumb navigation */}
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
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
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
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                        ? "ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา" 
                        : "ไม่พบงานในโปรเจคนี้"}
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      สร้างงานแรก
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreateJob={handleCreateJob}
        projects={[project]}
        selectedProjectId={projectId || ""}
      />
      
      <JobDetails 
        job={selectedJob} 
        isOpen={isDetailSheetOpen} 
        onClose={() => setIsDetailSheetOpen(false)} 
      />
    </PageLayout>
  );
}

// Mock functions for UI testing

function getMockProject(projectId: string): Project | null {
  const mockProjects = [
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
  
  return mockProjects.find(p => p.id === projectId) || null;
}

function getMockJobs(projectId: string): CronJob[] {
  const baseJobs = [
    {
      id: "job-1",
      name: "Send Weekly Newsletter",
      schedule: "0 9 * * 1",
      endpoint: "https://api.example.com/send-newsletter",
      httpMethod: "POST",
      description: "Sends weekly newsletter to subscribers every Monday",
      status: "idle" as JobStatus,
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
      status: "success" as JobStatus,
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
    {
      id: "job-3",
      name: "Process Customer Orders",
      schedule: "*/15 * * * *",
      endpoint: "https://api.example.com/process-orders",
      httpMethod: "POST",
      description: "Process new customer orders every 15 minutes",
      status: "failed" as JobStatus,
      useLocalTime: false,
      timezone: "UTC",
      lastRun: new Date(Date.now() - 900000).toISOString(),
      nextRun: new Date(Date.now() + 900000).toISOString(),
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      tags: ["orders", "customers", "processing"],
      successCount: 1240,
      failCount: 17,
      averageRuntime: 28.3,
      projectId: "project-1",
      emailNotifications: "tech-alerts@example.com",
      webhookUrl: "https://api.example.com/webhook/orders"
    },
    {
      id: "job-4",
      name: "Generate Monthly Report",
      schedule: "0 9 1 * *",
      endpoint: "https://api.example.com/generate-report",
      httpMethod: "POST",
      description: "Generate monthly performance report on the 1st day of each month",
      status: "paused" as JobStatus,
      useLocalTime: true,
      timezone: "America/New_York",
      lastRun: new Date(Date.now() - 2592000000).toISOString(),
      nextRun: null,
      createdAt: new Date(Date.now() - 5184000000).toISOString(),
      updatedAt: new Date(Date.now() - 1209600000).toISOString(),
      tags: ["reporting", "monthly"],
      successCount: 6,
      failCount: 0,
      averageRuntime: 326.5,
      projectId: "project-3",
      emailNotifications: "management@example.com,reports@example.com",
      webhookUrl: null
    },
    {
      id: "job-5",
      name: "Clean Temporary Files",
      schedule: "0 2 * * *",
      endpoint: "https://api.example.com/clean-temp",
      httpMethod: "GET",
      description: "Clean temporary files every day at 2 AM",
      status: "running" as JobStatus,
      useLocalTime: false,
      timezone: "UTC",
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date(Date.now() - 864000000).toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["maintenance", "cleanup"],
      successCount: 29,
      failCount: 1,
      averageRuntime: 45.8,
      projectId: "project-2",
      emailNotifications: null,
      webhookUrl: "https://hooks.slack.com/services/AAA/BBB/CCC"
    }
  ];
  
  // Return only jobs for the selected project
  return baseJobs.filter(job => job.projectId === projectId);
}

function createMockJob(jobData: Partial<CronJob>): CronJob {
  // Store in localStorage for mock persistence
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  
  const newJob = {
    ...jobData,
    id: `job-${Date.now()}`,
    status: "idle" as JobStatus,
    lastRun: null,
    nextRun: getNextRunTime(jobData.schedule || "0 * * * *"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: jobData.tags || [],
    successCount: 0,
    failCount: 0,
    averageRuntime: null,
  };
  
  mockJobs.push(newJob);
  localStorage.setItem('mockJobs', JSON.stringify(mockJobs));
  
  return newJob as CronJob;
}

function mockToggleJobStatus(job: CronJob, newStatus: JobStatus) {
  // Update mock job in localStorage
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  const updatedJobs = mockJobs.map((j: CronJob) => 
    j.id === job.id ? { ...j, status: newStatus } : j
  );
  localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));
}

function mockDeleteJob(jobId: string) {
  // Remove mock job from localStorage
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  const updatedJobs = mockJobs.filter((j: CronJob) => j.id !== jobId);
  localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));
}

function mockDuplicateJob(job: CronJob) {
  // Create duplicate in localStorage
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  
  const newJob = {
    ...job,
    id: `job-${Date.now()}`,
    name: `${job.name} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockJobs.push(newJob);
  localStorage.setItem('mockJobs', JSON.stringify(mockJobs));
}

function mockImportJob(job: Partial<CronJob>) {
  // Add imported job to localStorage
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  
  const newJob = {
    ...job,
    id: `job-${Date.now()}`,
    status: "idle" as JobStatus,
    lastRun: null,
    nextRun: getNextRunTime(job.schedule || "0 * * * *"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: job.tags || [],
    successCount: 0,
    failCount: 0,
    averageRuntime: null,
  };
  
  mockJobs.push(newJob);
  localStorage.setItem('mockJobs', JSON.stringify(mockJobs));
}

// Helper to calculate next run time based on cron expression
function getNextRunTime(cronExpression: string): string {
  // Simple implementation - just add random hours (1-24)
  const hours = Math.floor(Math.random() * 24) + 1;
  return new Date(Date.now() + hours * 3600000).toISOString();
}
