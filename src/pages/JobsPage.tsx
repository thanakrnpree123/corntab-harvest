import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { ProjectsTable } from "@/components/ProjectsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobExportImport } from "@/components/JobExportImport";
import { ProjectExportImport, ProjectWithJobs } from "@/components/ProjectExportImport";
import { CronJob, JobStatus, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { ProjectBatchActions } from "@/components/ProjectBatchActions";

const getMockProjects = () => [];
const getAllMockJobs = () => [];
const getMockJobs = (projectId: string) => [];
const createMockJob = (jobData: Partial<CronJob>) => ({});
const mockToggleJobStatus = (job: CronJob, newStatus: JobStatus) => {};
const mockDeleteJob = (jobId: string) => {};
const mockDuplicateJob = (job: CronJob) => {};
const mockImportJob = (job: Partial<CronJob>) => {};
const mockDeleteProject = (projectId: string) => {};
const mockImportProject = (projectWithJobs: ProjectWithJobs) => {};

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      setIsProjectLoading(true);
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          return response.data;
        }
        return getMockProjects();
      } catch (error) {
        console.warn("Using mock projects due to API error:", error);
        return getMockProjects();
      } finally {
        setIsProjectLoading(false);
      }
    }
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

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
        return getMockJobs(selectedProjectId);
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getMockJobs(selectedProjectId);
      }
    },
    enabled: !!selectedProjectId
  });

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
        return getAllMockJobs();
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getAllMockJobs();
      }
    }
  });

  const filteredJobs = jobs.filter(job => {
    const searchMatch = !searchQuery || 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    
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

  const handleDeleteProject = (projectId: string) => {
    apiService.deleteProject(projectId)
      .then(response => {
        if (response.success) {
          toast({
            title: "สำเร็จ",
            description: "ลบโปรเจคเรียบร้อยแล้ว",
          });
          
          if (selectedProjectId === projectId) {
            const remainingProjects = projects.filter(p => p.id !== projectId);
            if (remainingProjects.length > 0) {
              setSelectedProjectId(remainingProjects[0].id);
            } else {
              setSelectedProjectId("");
            }
          }
          
          refetchProjects();
          refetchAllJobs();
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถลบโปรเจค: ${response.error}`,
            variant: "destructive",
          });
          
          mockDeleteProject(projectId);
          refetchProjects();
          refetchAllJobs();
        }
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบโปรเจค: ${error.message}`,
          variant: "destructive",
        });
        
        mockDeleteProject(projectId);
        refetchProjects();
        refetchAllJobs();
      });
  };

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProjectId(project.id);
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, projectId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== projectId));
    }
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
        
        mockDuplicateJob(job);
        refetchJobs();
        refetchAllJobs();
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleImportJobs = (importedJobs: Partial<CronJob>[]) => {
    const jobsWithProject = importedJobs.map(job => ({
      ...job,
      projectId: selectedProjectId,
      useLocalTime: job.useLocalTime || false,
      timezone: job.timezone || "UTC",
    }));
    
    let successCount = 0;
    let failCount = 0;
    
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
    
    const importProjects = async () => {
      for (const projectWithJobs of projectsWithJobs) {
        try {
          const projectData = {
            name: projectWithJobs.name,
            description: projectWithJobs.description
          };
          
          const projectResponse = await apiService.createProject(projectData);
          
          if (projectResponse.success && projectResponse.data) {
            const newProjectId = projectResponse.data.id;
            
            if (successCount === 0) {
              newSelectedProjectId = newProjectId;
            }
            
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
            mockImportProject(projectWithJobs);
          }
        } catch (error) {
          failCount++;
          console.error("Error importing project:", error);
          mockImportProject(projectWithJobs);
        }
      }
      
      await refetchProjects();
      await refetchAllJobs();
      
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

  const handleExportJobs = (format: "json" | "csv") => {
    const exportData = jobs.map(job => ({
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
      content = JSON.stringify(exportData, null, 2);
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
      
      const rows = exportData.map(job => {
        return [
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
        ].join(",");
      });
      
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
      description: `ส่งออกข้อมูล ${jobs.length} งานเรียบร้อยแล้ว`,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setDateFilter("all");
    setIsFilterOpen(false);
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    dateFilter !== "all",
    sortBy !== "name" || sortOrder !== "asc"
  ].filter(Boolean).length;

  const handleExportProjects = (projectIds: string[], format: "json" | "csv") => {
    console.log(`Exporting ${projectIds.length} projects in ${format} format`);
    
    toast({
      title: "ส่งออกโปรเจค",
      description: `กำลังส่งออก ${projectIds.length} โปรเจคในรูปแบบ ${format.toUpperCase()}`,
    });
  };

  const handleBatchDeleteProjects = (projectIds: string[]) => {
    console.log(`Deleting ${projectIds.length} projects`);
    
    const deletePromises = projectIds.map(projectId => 
      apiService.deleteProject(projectId)
        .catch(() => {
          mockDeleteProject(projectId);
        })
    );
    
    Promise.all(deletePromises)
      .then(() => {
        toast({
          title: "สำเร็จ",
          description: `ลบ ${projectIds.length} โปรเจคเรียบร้อยแล้ว`,
        });
        
        const deletedSelectedProject = projectIds.includes(selectedProjectId);
        if (deletedSelectedProject) {
          const remainingProjects = projects.filter(p => !projectIds.includes(p.id));
          if (remainingProjects.length > 0) {
            setSelectedProjectId(remainingProjects[0].id);
          } else {
            setSelectedProjectId("");
          }
        }
        
        setSelectedIds([]);
        
        refetchProjects();
        refetchAllJobs();
      })
      .catch(error => {
        toast({
          title: "เกิดข้อผิดพลาดระหว่างการลบโปรเจค",
          description: error.message,
          variant: "destructive",
        });
      });
  };

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
              {selectedIds.length > 0 && (
                <ProjectBatchActions
                  projects={projects}
                  selectedProjectIds={selectedIds}
                  onExport={handleExportProjects}
                  onDelete={handleBatchDeleteProjects}
                />
              )}
              
              <Card>
                <CardContent className="p-0">
                  <ProjectsTable 
                    projects={projects}
                    onViewDetails={handleViewProjectDetails}
                    onAddJob={(projectId) => {
                      setSelectedProjectId(projectId);
                      setIsCreateModalOpen(true);
                    }}
                    onDeleteProject={handleDeleteProject}
                    onViewJobs={setSelectedProjectId}
                    selectedProjectId={selectedProjectId}
                    onSelect={handleSelectProject}
                    selectedIds={selectedIds}
                  />
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
                      
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        เพิ่มงาน
                      </Button>
                    </div>
                    
                    {jobs.length > 0 && (
                      <JobExportImport 
                        jobs={jobs} 
                        onImport={handleImportJobs}
                        onExport={handleExportJobs}
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
                          <JobsTable 
                            jobs={sortedJobs} 
                            onViewDetails={handleViewJobDetails} 
                            onToggleStatus={(jobId) => {
                              const job = jobs.find(j => j.id === jobId);
                              if (!job) return null;
                              
                              if (isJobActionInProgress[jobId]) {
                                return <Button variant="outline" size="sm" disabled>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Please wait
                                </Button>;
                              }
                              
                              const action = job.status === "paused" ? "activate" : "pause";
                              const ActionDialog = ({ onConfirm }: { onConfirm: () => void }) => (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant={action === "pause" ? "outline" : "default"} 
                                      size="sm"
                                    >
                                      {action === "pause" ? "Pause" : "Activate"}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {action === "pause" ? "Pause Job" : "Activate Job"}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {action === "pause" 
                                          ? `Are you sure you want to pause "${job.name}"? The job will not run until you activate it again.` 
                                          : `Are you sure you want to activate "${job.name}"? The job will start running according to its schedule.`}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={onConfirm}>
                                        {action === "pause" ? "Pause" : "Activate"}
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
                                  Please wait
                                </Button>;
                              }
                              
                              return (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicate
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Duplicate Job</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to duplicate "{job.name}"?
                                        A new job will be created with the same settings.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDuplicateJob(jobId)}>
                                        Duplicate
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              );
                            }}
                            onDeleteJob={handleDeleteJob}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <p className="mb-4 text-muted-foreground">ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา</p>
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
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">ยังไม่มีโปรเจค กรุณาสร้างโปรเจคเพื่อเริ่มต้นใช้งาน</p>
              <Button onClick={() => setIsCreateProjectModalOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                สร้างโปรเจคใหม่
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
