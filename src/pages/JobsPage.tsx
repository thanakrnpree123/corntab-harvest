import React, { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, PlusCircle, Loader2, Filter, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

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

function getAllMockJobs(): CronJob[] {
  const allJobs: CronJob[] = [];
  const projects = getMockProjects();
  
  projects.forEach(project => {
    const projectJobs = getMockJobs(project.id);
    allJobs.push(...projectJobs);
  });
  
  return allJobs;
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
  
  return baseJobs.filter(job => job.projectId === projectId);
}

function createMockJob(jobData: Partial<CronJob>): CronJob {
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
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  const updatedJobs = mockJobs.map((j: CronJob) => 
    j.id === job.id ? { ...j, status: newStatus } : j
  );
  localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));
}

function mockDeleteJob(jobId: string) {
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  const updatedJobs = mockJobs.filter((j: CronJob) => j.id !== jobId);
  localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));
}

function mockDeleteProject(projectId: string) {
  const mockProjects = JSON.parse(localStorage.getItem('mockProjects') || '[]');
  const updatedProjects = mockProjects.filter((p: Project) => p.id !== projectId);
  localStorage.setItem('mockProjects', JSON.stringify(updatedProjects));
  
  const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
  const updatedJobs = mockJobs.filter((j: CronJob) => j.projectId !== projectId);
  localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));
}

function mockDuplicateJob(job: CronJob) {
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

function mockImportProject(projectWithJobs: ProjectWithJobs) {
  const mockProjects = JSON.parse(localStorage.getItem('mockProjects') || '[]');
  
  const newProjectId = `project-${Date.now()}`;
  const newProject = {
    id: newProjectId,
    name: projectWithJobs.name,
    description: projectWithJobs.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockProjects.push(newProject);
  localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
  
  if (projectWithJobs.jobs && projectWithJobs.jobs.length > 0) {
    const mockJobs = JSON.parse(localStorage.getItem('mockJobs') || '[]');
    
    for (const job of projectWithJobs.jobs) {
      const newJob = {
        ...job,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        projectId: newProjectId,
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
    }
    
    localStorage.setItem('mockJobs', JSON.stringify(mockJobs));
  }
}

function getNextRunTime(cronExpression: string): string {
  const hours = Math.floor(Math.random() * 24) + 1;
  return new Date(Date.now() + hours * 3600000).toISOString();
}

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  
  const { toast } = useToast();
  const [isProjectLoading, setIsProjectLoading] = useState(false);

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

  const handleSelectAllProjects = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(projects.map(p => p.id));
    } else {
      setSelectedProjectIds([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(prev => [...prev, projectId]);
    } else {
      setSelectedProjectIds(prev => prev.filter(id => id !== projectId));
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const handleBatchDeleteProjects = () => {
    if (selectedProjectIds.length === 0) return;
    
    selectedProjectIds.forEach(projectId => {
      handleDeleteProject(projectId);
    });
    setSelectedProjectIds([]);
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
          description: "เน���่องจาก API ไม่พร้อมใช้งาน จึงสร้างข้อมูลทดสอบให้แทน",
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
    // Implementation for exporting jobs
    const jobsToExport = jobs;
    const fileName = `jobs-export-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') {
      const jsonData = JSON.stringify(jobsToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "ส่งออกสำเร็จ",
        description: `ส่งออกงาน ${jobsToExport.length} รายการในรูปแบบ JSON`,
      });
    } else {
      // For CSV format
      const headers = ['name', 'schedule', 'endpoint', 'httpMethod', 'description', 'status'];
      const csvRows = [
        headers.join(','),
        ...jobsToExport.map(job => {
          return headers.map(header => {
            const field = job[header as keyof CronJob];
            if (typeof field === 'string' && field.includes(',')) {
              return `"${field}"`;
            }
            return String(field || '');
          }).join(',');
        })
      ];
      
      const csvData = csvRows.join('\n');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "ส่งออกสำเร็จ",
        description: `ส่งออกงาน ${jobsToExport.length} รายการในรูปแบบ CSV`,
      });
    }
  };

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

  return (
    <PageLayout title="Job Management">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Projects</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCreateProjectModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="select-all-projects" 
                      checked={selectedProjectIds.length === projects.length && projects.length > 0}
                      onCheckedChange={handleSelectAllProjects}
                    />
                    <label 
                      htmlFor="select-all-projects" 
                      className="text-sm cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                  
                  {selectedProjectIds.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Projects</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedProjectIds.length} selected projects? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBatchDeleteProjects}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                <Input
                  placeholder="Search projects..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  className="mb-2"
                />
                
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {isProjectLoading ? (
                    <div className="flex justify-center my-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <div 
                        key={project.id} 
                        className={`flex items-center p-2 rounded hover:bg-slate-100 cursor-pointer ${selectedProjectId === project.id ? 'bg-slate-100 font-medium' : ''}`}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox 
                            id={`project-${project.id}`}
                            checked={selectedProjectIds.includes(project.id)}
                            onCheckedChange={(checked) => {
                              handleSelectProject(project.id, !!checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="truncate">{project.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No projects found
                    </div>
                  )}
                </div>
                
                <ProjectExportImport
                  projects={projects}
                  jobs={allJobs}
                  onImport={handleImportProjects}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-9">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                <h2 className="text-lg font-semibold">Jobs</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-auto">
                    <Input
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="relative">
                        <Filter className="h-4 w-4" />
                        {activeFiltersCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                          >
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Status</h3>
                          <Select 
                            value={statusFilter} 
                            onValueChange={(val) => setStatusFilter(val as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="idle">Idle</SelectItem>
                              <SelectItem value="running">Running</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Created Date</h3>
                          <Select 
                            value={dateFilter} 
                            onValueChange={(val) => setDateFilter(val as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="week">This Week</SelectItem>
                              <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Sort By</h3>
                          <div className="flex gap-2">
                            <Select 
                              value={sortBy} 
                              onValueChange={setSortBy}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="date">Creation Date</SelectItem>
                                <SelectItem value="lastRun">Last Run</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            >
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear Filters</Button>
                          <Button size="sm" onClick={() => setIsFilterOpen(false)}>Apply</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="default"
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!selectedProjectId}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Job
                  </Button>
                </div>
              </div>
              
              {selectedProjectId && (
                <>
                  <Separator className="my-4" />
                  
                  {isLoadingJobs ? (
                    <div className="flex justify-center my-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    sortedJobs.length > 0 ? (
                      <JobsTable 
                        jobs={sortedJobs}
                        onToggleStatus={toggleJobStatus}
                        onDeleteJob={handleDeleteJob}
                        onDuplicateJob={handleDuplicateJob}
                        onViewDetails={handleViewJobDetails}
                        isActionInProgress={isJobActionInProgress}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {searchQuery || statusFilter !== "all" || dateFilter !== "all" ? (
                          <>
                            <p>No jobs match your filters.</p>
                            <Button variant="link" onClick={handleClearFilters}>Clear filters</Button>
                          </>
                        ) : (
                          <>
                            <p>No jobs found for this project.</p>
                            <Button 
                              variant="link" 
                              onClick={() => setIsCreateModalOpen(true)}
                            >
                              Add your first job
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  )}
                  
                  <JobExportImport
                    jobs={jobs}
                    onImport={handleImportJobs}
                    onExport={handleExportJobs}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedProjectId && (
        <CreateJobModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateJob={handleCreateJob}
          projects={projects}
          selectedProjectId={selectedProjectId}
        />
      )}
      
      {selectedJob && (
        <JobDetails
          job={selectedJob}
          isOpen={isDetailSheetOpen}
          onClose={() => {
            setIsDetailSheetOpen(false);
            setSelectedJob(null);
          }}
          onDelete={() => {
            handleDeleteJob(selectedJob.id);
            setIsDetailSheetOpen(false);
          }}
          onTrigger={selectedJob.id ? () => {
            // Handle trigger if needed
          } : undefined}
        />
      )}
    </PageLayout>
  );
}
