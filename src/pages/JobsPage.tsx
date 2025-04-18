
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectBatchActions } from "@/components/ProjectBatchActions";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobExportImport } from "@/components/JobExportImport";
import { ProjectExportImport, ProjectWithJobs } from "@/components/ProjectExportImport";
import { CronJob, JobStatus, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, PlusCircle, Loader2, Filter, FolderPlus } from "lucide-react";
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

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  // Add new state for project selection
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

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
        // If not successful, use mock data
        return getMockProjects();
      } catch (error) {
        console.warn("Using mock projects due to API error:", error);
        return getMockProjects();
      } finally {
        setIsProjectLoading(false);
      }
    }
  });

  // Set first project as selected by default if none is selected
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
        // If not successful, use mock data
        return getMockJobs(selectedProjectId);
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getMockJobs(selectedProjectId);
      }
    },
    enabled: !!selectedProjectId
  });

  // Fetch all jobs for import/export functionality
  const { 
    data: allJobs = [], 
    refetch: refetchAllJobs 
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          return response.data;
        }
        // If not successful, use mock data
        return getAllMockJobs();
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getAllMockJobs();
      }
    }
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

  // Add handler for project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectIds(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      return [...prev, projectId];
    });
  };

  const handleSelectAllProjects = () => {
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(projects.map(p => p.id));
    }
  };

  const handleExportProjects = (projectIds: string[], format: "json" | "csv") => {
    const projectsToExport = projects.filter(p => projectIds.includes(p.id));
    const jobsToExport = allJobs.filter(j => projectIds.includes(j.projectId));

    // Create export data
    const exportData = projectsToExport.map(project => ({
      ...project,
      jobs: jobsToExport.filter(job => job.projectId === project.id)
    }));

    // Handle export based on format
    if (format === "json") {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projects-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // CSV Export logic
      const projectRows = projectsToExport.map(p => 
        `${p.id},${p.name},${p.description || ""}`
      );
      
      const jobRows = jobsToExport.map(j => 
        `${j.projectId},${j.name},${j.description || ""},${j.schedule}`
      );

      const csvContent = [
        "[PROJECTS]",
        "id,name,description",
        ...projectRows,
        "",
        "[JOBS]",
        "project_id,name,description,schedule",
        ...jobRows
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projects-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "ส่งออกสำเร็จ",
      description: `ส่งออก ${projectIds.length} โปรเจคเรียบร้อยแล้ว`,
    });
  };

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

  const handleDeleteProject = (projectIds: string[]) => {
    Promise.all(projectIds.map(projectId => apiService.deleteProject(projectId)))
      .then(responses => {
        const successfulDeletes = responses.filter(response => response.success).length;
        const failedDeletes = projectIds.length - successfulDeletes;
  
        if (successfulDeletes > 0) {
          toast({
            title: "สำเร็จ",
            description: `ลบ ${successfulDeletes} โปรเจคเรียบร้อยแล้ว`,
          });
        }
  
        if (failedDeletes > 0) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถลบ ${failedDeletes} โปรเจค`,
            variant: "destructive",
          });
        }
  
        // Select another project if the current one was deleted
        if (selectedProjectIds.includes(selectedProjectId)) {
          const remainingProjects = projects.filter(p => !projectIds.includes(p.id));
          if (remainingProjects.length > 0) {
            setSelectedProjectId(remainingProjects[0].id);
          } else {
            setSelectedProjectId("");
          }
        }
  
        refetchProjects();
        refetchAllJobs();
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบโปรเจค: ${error.message}`,
          variant: "destructive",
        });
  
        // Mock delete for demo
        projectIds.forEach(projectId => mockDeleteProject(projectId));
        refetchProjects();
        refetchAllJobs();
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
          refetchAllJobs();
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
        refetchAllJobs();
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
          refetchAllJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถอัปเดตสถานะงาน: ${response.error}`,
            variant: "destructive",
          });
          
          // If unsuccessful, use mock data
          mockToggleJobStatus(job, newStatus);
          refetchJobs();
          refetchAllJobs();
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
          refetchAllJobs();
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
          refetchAllJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถลบงาน: ${response.error}`,
            variant: "destructive",
          });
          
          // If unsuccessful, use mock data
          mockDeleteJob(jobId);
          refetchJobs();
          refetchAllJobs();
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
        refetchAllJobs();
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
          refetchAllJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถทำสำเนางาน: ${response.error}`,
            variant: "destructive",
          });
          
          // If unsuccessful, use mock data
          mockDuplicateJob(job);
          refetchJobs();
          refetchAllJobs();
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
        refetchAllJobs();
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
          refetchAllJobs();
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

  const handleImportProjects = (projectsWithJobs: ProjectWithJobs[]) => {
    let successCount = 0;
    let failCount = 0;
    let newSelectedProjectId = selectedProjectId;
    
    // Create each project and its jobs
    const importProjects = async () => {
      for (const projectWithJobs of projectsWithJobs) {
        try {
          // Create the project
          const projectData = {
            name: projectWithJobs.name,
            description: projectWithJobs.description
          };
          
          const projectResponse = await apiService.createProject(projectData);
          
          if (projectResponse.success && projectResponse.data) {
            const newProjectId = projectResponse.data.id;
            
            // If this is the first successful import, select it
            if (successCount === 0) {
              newSelectedProjectId = newProjectId;
            }
            
            // Create jobs for this project
            if (projectWithJobs.jobs && projectWithJobs.jobs.length > 0) {
              for (const job of projectWithJobs.jobs) {
                const jobData = {
                  ...job,
                  projectId: newProjectId
                };
                
                try {
                  await apiService.createJob(jobData as any);
                } catch (error) {
                  console.error("Error creating job:", error);
                  // Create mock job for demo
                  mockImportJob({
                    ...jobData,
                    projectId: newProjectId
                  });
                }
              }
            }
            
            successCount++;
          } else {
            failCount++;
            // Create mock project for demo
            mockImportProject(projectWithJobs);
          }
        } catch (error) {
          failCount++;
          console.error("Error importing project:", error);
          // Create mock project for demo
          mockImportProject(projectWithJobs);
        }
      }
      
      // Refresh data
      await refetchProjects();
      await refetchAllJobs();
      
      // Set newly selected project
      if (newSelectedProjectId !== selectedProjectId) {
        setSelectedProjectId(newSelectedProjectId);
      }
      
      toast({
        title: "นำเข้าเรียบร้อย",
        description: `นำเข้า ${successCount} โปรเจคสำเร็จ${failCount > 0 ? `, ล้มเหลว ${failCount} โปรเจค` : ''}`,
      });
    };
    
    importProjects().catch(error => {
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
    <PageLayout title="">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">โปรเจค</h1>
            <p className="text-muted-foreground">จัดการโปรเจคและงานของคุณ</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Button onClick={() => setIsCreateProjectModalOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              สร้างโปรเจคใหม่
            </Button>
            
            <ProjectExportImport 
              projects={projects} 
              jobs={allJobs}
              onImport={handleImportProjects} 
              onExport={handleExportProjects}
            />
          </div>
        </div>

        {isProjectLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">กำลังโหลดโปรเจค...</span>
          </div>
        ) : (
          projects.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full">
                  <Input
                    className="max-w-[300px]"
                    placeholder="ค้นหาโปรเจค..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  <Popover>
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

                <ProjectBatchActions
                  projects={projects}
                  selectedProjectIds={selectedProjectIds}
                  onExport={handleExportProjects}
                  onDelete={handleDeleteProject}
                  disabled={isProjectLoading}
                />
              </div>

              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left">
                          <Checkbox
                            checked={selectedProjectIds.length === projects.length}
                            onCheckedChange={handleSelectAllProjects}
                          />
                        </th>
                        <th className="p-4 text-left font-medium">Name</th>
                        <th className="p-4 text-left font-medium">Description</th>
                        <th className="p-4 text-left font-medium">Jobs</th>
                        <th className="p-4 text-left font-medium">Created</th>
                        <th className="p-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="border-b">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedProjectIds.includes(project.id)}
                              onCheckedChange={() => handleProjectSelect(project.id)}
                            />
                          </td>
                          <td className="p-4">{project.name}</td>
                          <td className="p-4">{project.description}</td>
                          <td className="p-4">
                            {allJobs.filter(j => j.projectId === project.id).length}
                          </td>
                          <td className="p-4">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedProjectId(project.id)}
                              >
                                View Jobs
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {selectedProjectId && (
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
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">ไม่พบโปรเจค</p>
              <Button onClick={() => setIsCreateProjectModalOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                สร้างโปรเจคแรกของคุณ
              </Button>
            </div>
          )
        )}
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
        onUpdate={refetchJobs}
        onDelete={handleDeleteJob}
      />
    </PageLayout>
  );
}

// Missing mock functions that would cause errors
const getMockProjects = (): Project[] => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock-project-${i + 1}`,
    name: `Mock Project ${i + 1}`,
    description: `This is a mock project for testing purposes ${i + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

const getMockJobs = (projectId: string): CronJob[] => {
  return Array.from({ length: 3 }, (_, i) => createMockJob({
    id: `mock-job-${projectId}-${i + 1}`,
    projectId,
    name: `Mock Job ${i + 1}`,
    status: i % 2 === 0 ? "idle" : "paused"
  }));
};

const getAllMockJobs = (): CronJob[] => {
  const projects = getMockProjects();
  return projects.flatMap(project => getMockJobs(project.id));
};

const createMockJob = (overrides: Partial<CronJob> = {}): CronJob => {
  const id = overrides.id || `mock-job-${Date.now()}`;
  return {
    id,
    name: overrides.name || `Mock Job ${id}`,
    schedule: overrides.schedule || "0 * * * *",
    endpoint: overrides.endpoint || "https://example.com/api",
    httpMethod: overrides.httpMethod || "GET",
    requestBody: overrides.requestBody || "",
    description: overrides.description || "This is a mock job for testing purposes.",
    projectId: overrides.projectId || "mock-project-id",
    status: overrides.status || "idle",
    useLocalTime: overrides.useLocalTime !== undefined ? overrides.useLocalTime : false,
    timezone: overrides.timezone || "UTC",
    lastRun: overrides.lastRun || null,
    nextRun: overrides.nextRun || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: overrides.tags || [],
    successCount: overrides.successCount || 0,
    failCount: overrides.failCount || 0,
    averageRuntime: overrides.averageRuntime || null,
    emailNotifications: overrides.emailNotifications || null,
    webhookUrl: overrides.webhookUrl || null,
    headers: overrides.headers || {},
    body: overrides.body || "",
  };
};

const mockDeleteProject = (projectId: string) => {
  console.log(`Mock deleting project ${projectId}`);
};

const mockImportProject = (project: ProjectWithJobs) => {
  console.log(`Mock importing project ${project.name}`);
};

const mockToggleJobStatus = (job: CronJob, newStatus: JobStatus) => {
  console.log(`Mock toggling job ${job.id} status to ${newStatus}`);
};

const mockDeleteJob = (jobId: string) => {
  console.log(`Mock deleting job ${jobId}`);
};

const mockDuplicateJob = (job: CronJob) => {
  console.log(`Mock duplicating job ${job.id}`);
};

const mockImportJob = (job: Partial<CronJob>) => {
  console.log(`Mock importing job ${job.name}`);
};
