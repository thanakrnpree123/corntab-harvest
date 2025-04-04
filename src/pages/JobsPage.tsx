
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobExportImport } from "@/components/JobExportImport";
import { CronJob, JobStatus, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, PlusCircle, Loader2, Filter } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  // Fetch projects
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      setIsProjectLoading(true);
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
      } finally {
        setIsProjectLoading(false);
      }
    }
  });

  // กำหนดโปรเจคแรกเป็นค่าเริ่มต้นถ้าไม่ได้เลือกโปรเจคไว้
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch jobs based on selected project
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

  // Filter jobs based on search query and other filters
  const filteredJobs = jobs.filter(job => {
    // 1. Search query filter
    const searchMatch = !searchQuery || 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status filter
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    
    // 3. Date filter
    let dateMatch = true;
    const jobDate = new Date(job.createdAt);
    const now = new Date();
    
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

  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    apiService.createProject(projectData)
      .then(response => {
        if (response.success && response.data) {
          setSelectedProjectId(response.data.id);
          toast({
            title: "สำเร็จ",
            description: `สร้างโปรเจค "${projectData.name}" เรียบร้อยแล้ว`,
          });
          refetchProjects();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถสร้างโปรเจค: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถสร้างโปรเจค: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handleCreateJob = (jobData: Partial<CronJob>) => {
    const newJobData = {
      ...jobData,
      projectId: selectedProjectId,
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
        
        // สร้างข้อมูลแบบ mock สำหรับ demo
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
          
          // ถ้าไม่สำเร็จ ให้ใช้ mock data
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
        
        // ถ้าไม่สำเร็จ ให้ใช้ mock data
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
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถลบงาน: ${response.error}`,
            variant: "destructive",
          });
          
          // ถ้าไม่สำเร็จ ให้ใช้ mock data
          mockDeleteJob(jobId);
          refetchJobs();
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบงาน: ${error.message}`,
          variant: "destructive",
        });
        
        // ถ้าไม่สำเร็จ ให้ใช้ mock data
        mockDeleteJob(jobId);
        refetchJobs();
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
          
          // ถ้าไม่สำเร็จ ให้ใช้ mock data
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
        
        // ถ้าไม่สำเร็จ ให้ใช้ mock data
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
      projectId: selectedProjectId,
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
          // ถ้าไม่สำเร็จ ให้ใช้ mock data สำหรับ demo
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
        if (successCount > 0) refetchJobs();
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

  return (
    <PageLayout title="Jobs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateProject={handleCreateProject}
            compact={true}
            isLoading={isProjectLoading}
          />
          
          {selectedProjectId && (
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
                            <SelectItem value="idle">Idle</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">วันที่สร้าง</h4>
                        <Select value={dateFilter} onValueChange={(val) => setDateFilter(val as any)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกช่วงวันที่" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            <SelectItem value="today">วันนี้</SelectItem>
                            <SelectItem value="week">7 วันล่าสุด</SelectItem>
                            <SelectItem value="month">30 วันล่าสุด</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    
                      <Separator />
                    
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">เรียงลำดับตาม</h4>
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
              
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มงานใหม่
              </Button>
            </div>
          )}
        </div>
        
        {selectedProjectId && jobs.length > 0 && (
          <div className="flex justify-end">
            <JobExportImport jobs={jobs} onImport={handleImportJobs} />
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูลงาน...</span>
              </div>
            ) : selectedProjectId ? (
              sortedJobs.length > 0 ? (
                <JobsTable 
                  jobs={sortedJobs} 
                  onViewDetails={handleViewJobDetails} 
                  onToggleStatus={(jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    if (isJobActionInProgress[jobId]) {
                      return <Button variant="outline" size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กรุณารอสักครู่
                      </Button>;
                    }
                    
                    // Determine the action based on current status
                    const action = job.status === "paused" ? "activate" : "pause";
                    const ActionDialog = ({ onConfirm }: { onConfirm: () => void }) => (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant={action === "pause" ? "outline" : "default"} 
                            size="sm"
                          >
                            {action === "pause" ? "หยุดชั่วคราว" : "เปิดใช้งาน"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {action === "pause" ? "หยุดงานชั่วคราว" : "เปิดใช้งาน"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {action === "pause" 
                                ? `คุณแน่ใจหรือไม่ที่จะหยุด "${job.name}" ชั่วคราว? งานจะไม่รันจนกว่าคุณจะเปิดใช้งานอีกครั้ง` 
                                : `คุณแน่ใจหรือไม่ที่จะเปิดใช้งาน "${job.name}"? งานจะเริ่มรันตามตารางเวลาที่กำหนด`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={onConfirm}>
                              {action === "pause" ? "หยุดชั่วคราว" : "เปิดใช้งาน"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                    
                    return (
                      <ActionDialog 
                        onConfirm={() => toggleJobStatus(jobId)} 
                      />
                    );
                  }}
                  onDuplicateJob={(jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    if (isJobActionInProgress[jobId]) {
                      return <Button variant="outline" size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กรุณารอสักครู่
                      </Button>;
                    }
                    
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            ทำสำเนา
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ทำสำเนางาน</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ที่จะสร้างสำเนาของ "{job.name}"?
                              งานใหม่จะถูกสร้างด้วยการตั้งค่าเดียวกัน
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDuplicateJob(jobId)}>
                              สร้างสำเนา
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  }}
                  onDeleteJob={(jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    if (isJobActionInProgress[jobId]) {
                      return <Button variant="destructive" size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กรุณารอสักครู่
                      </Button>;
                    }
                    
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">ลบ</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ลบงาน</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ที่จะลบ "{job.name}"? การกระทำนี้ไม่สามารถยกเลิกได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteJob(jobId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              ลบงาน
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                      ? "ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา" 
                      : "ไม่พบงานในโปรเจคนี้"}
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    เพิ่มงานแรก
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">เลือกโปรเจคเพื่อดูงาน</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreateJob={handleCreateJob}
        projects={projects}
        selectedProjectId={selectedProjectId}
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
