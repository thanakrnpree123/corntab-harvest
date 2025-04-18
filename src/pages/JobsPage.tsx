import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { ProjectsTable } from "@/components/ProjectsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobExportImport } from "@/components/JobExportImport";
import {
  ProjectExportImport,
  ProjectWithJobs,
} from "@/components/ProjectExportImport";
import { CronJob, JobStatus, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, PlusCircle, Loader2, Filter, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProjectBatchActions } from "@/components/ProjectBatchActions";

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{
    [key: string]: boolean;
  }>({});
  const { toast } = useToast();
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<
    "today" | "week" | "month" | "all"
  >("all");

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const handleSelectProject = (projectId: string, checked: boolean) => {
    setSelectedProjectIds((prev) =>
      checked ? [...prev, projectId] : prev.filter((id) => id !== projectId),
    );
  };

  const handleSelectAllProjects = (checked: boolean) => {
    setSelectedProjectIds(checked ? projects.map((p) => p.id) : []);
  };

  const handleBatchExport = (projectIds: string[], format: "json" | "csv") => {
    const projectsToExport = projects.filter((p) => projectIds.includes(p.id));
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(projectsToExport, null, 2);
      filename = `projects-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    } else {
      const headers = [
        "id",
        "name",
        "description",
        "createdAt",
        "updatedAt",
      ].join(",");
      const rows = projectsToExport.map((project) =>
        [
          project.id,
          `"${project.name}"`,
          `"${project.description || ""}"`,
          project.createdAt,
          project.updatedAt,
        ].join(","),
      );
      content = [headers, ...rows].join("\n");
      filename = `projects-export-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBatchDelete = async (projectIds: string[]) => {
    try {
      for (const projectId of projectIds) {
        await apiService.deleteProject(projectId); // ← ใช้ API ของคุณ
      }
      setSelectedProjectIds([]);
    } catch (error) {
      console.error("ไม่สามารถลบโปรเจค:", error);
    }
  };

  // Fetch projects
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ["projects"],
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
    },
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
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["jobs", selectedProjectId],
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
    enabled: !!selectedProjectId,
  });

  // Fetch all jobs for import/export functionality
  const { data: allJobs = [], refetch: refetchAllJobs } = useQuery({
    queryKey: ["jobs"],
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
    },
  });

  // Filter jobs based on search query and other filters
  const filteredJobs = jobs.filter((job) => {
    // 1. Search query filter
    const searchMatch =
      !searchQuery ||
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
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "lastRun":
        // Handle null values
        if (!a.lastRun && !b.lastRun) comparison = 0;
        else if (!a.lastRun) comparison = 1;
        else if (!b.lastRun) comparison = -1;
        else
          comparison =
            new Date(a.lastRun).getTime() - new Date(b.lastRun).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleCreateProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => {
    apiService
      .createProject(projectData)
      .then((response) => {
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
      .catch((error) => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถสร้างโปรเจค: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handleDeleteProject = (projectId: string) => {
    apiService
      .deleteProject(projectId)
      .then((response) => {
        if (response.success) {
          toast({
            title: "สำเร็จ",
            description: "ลบโปรเจคเรียบร้อยแล้ว",
          });

          // Select another project if the current one was deleted
          if (selectedProjectId === projectId) {
            const remainingProjects = projects.filter(
              (p) => p.id !== projectId,
            );
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

          // Mock delete for demo
          mockDeleteProject(projectId);
          refetchProjects();
          refetchAllJobs();
        }
      })
      .catch((error) => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถลบโปรเจค: ${error.message}`,
          variant: "destructive",
        });

        // Mock delete for demo
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

    apiService
      .createJob(newJobData as any)
      .then((response) => {
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
      .catch((error) => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถสร้างงาน: ${error.message}`,
          variant: "destructive",
        });

        // Create mock data for demo
        const mockJob = createMockJob({
          ...newJobData,
          id: `mock-${Date.now()}`,
        });
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
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    setIsJobActionInProgress((prev) => ({ ...prev, [jobId]: true }));
    const newStatus = job.status === "paused" ? "idle" : "paused";

    apiService
      .updateJob(jobId, { status: newStatus })
      .then((response) => {
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
      .catch((error) => {
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
        setIsJobActionInProgress((prev) => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDeleteJob = (jobId: string) => {
    setIsJobActionInProgress((prev) => ({ ...prev, [jobId]: true }));

    apiService
      .deleteJob(jobId)
      .then((response) => {
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
      .catch((error) => {
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
        setIsJobActionInProgress((prev) => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDuplicateJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    setIsJobActionInProgress((prev) => ({ ...prev, [jobId]: true }));

    apiService
      .duplicateJob(jobId)
      .then((response) => {
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
      .catch((error) => {
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
        setIsJobActionInProgress((prev) => ({ ...prev, [jobId]: false }));
      });
  };

  const handleImportJobs = (importedJobs: Partial<CronJob>[]) => {
    // Add the current projectId to all imported jobs
    const jobsWithProject = importedJobs.map((job) => ({
      ...job,
      projectId: selectedProjectId,
      useLocalTime: job.useLocalTime || false,
      timezone: job.timezone || "UTC",
    }));

    let successCount = 0;
    let failCount = 0;

    // Create each job one by one
    const createPromises = jobsWithProject.map((job) =>
      apiService
        .createJob(job as any)
        .then((response) => {
          if (response.success) successCount++;
          else failCount++;
          return response;
        })
        .catch(() => {
          // If unsuccessful, use mock data for demo
          mockImportJob(job);
          successCount++;
          return { success: true };
        }),
    );

    Promise.all(createPromises)
      .then(() => {
        toast({
          title: "นำเข้าเรียบร้อย",
          description: `นำเข้า ${successCount} งานสำเร็จ${failCount > 0 ? `, ล้มเหลว ${failCount} งาน` : ""}`,
        });
        if (successCount > 0) {
          refetchJobs();
          refetchAllJobs();
        }
      })
      .catch((error) => {
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
            description: projectWithJobs.description,
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
                  projectId: newProjectId,
                };

                try {
                  await apiService.createJob(jobData as any);
                } catch (error) {
                  console.error("Error creating job:", error);
                  // Create mock job for demo
                  mockImportJob({
                    ...jobData,
                    projectId: newProjectId,
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
        description: `นำเข้า ${successCount} โปรเจคสำเร็จ${failCount > 0 ? `, ล้มเหลว ${failCount} โปรเจค` : ""}`,
      });
    };

    importProjects().catch((error) => {
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
    sortBy !== "name" || sortOrder !== "asc",
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
            />
            <ProjectBatchActions
              projects={projects}
              selectedProjectIds={selectedProjectIds}
              onExport={handleBatchExport}
              onDelete={handleBatchDelete}
              disabled={projects.length === 0}
            />
          </div>
        </div>

        {isProjectLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              กำลังโหลดโปรเจค...
            </span>
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <ProjectsTable
                  projects={projects}
                  onAddJob={(projectId) => {
                    setSelectedProjectId(projectId);
                    setIsCreateModalOpen(true);
                  }}
                  onDeleteProject={handleDeleteProject}
                  onViewJobs={setSelectedProjectId}
                  selectedProjectId={selectedProjectId}
                  selectedProjectIdsPops={selectedProjectIds}
                  onSelectProject={handleSelectProject}
                  onSelectAllProjects={handleSelectAllProjects}
                />
              </CardContent>
            </Card>

            {/* {selectedProjectId && (
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
                      <JobExportImport jobs={jobs} onImport={handleImportJobs} />
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

                              // Determine the action based on current status
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
                            onDeleteJob={(jobId) => {
                              const job = jobs.find(j => j.id === jobId);
                              if (!job) return null;

                              if (isJobActionInProgress[jobId]) {
                                return <Button variant="destructive" size="sm" disabled>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Please wait
                                </Button>;
                              }

                              return (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{job.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteJob(jobId)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
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
                              สร้างงานแรก
                            </Button>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
              )} */}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีโปรเจค</h3>
            <p className="text-muted-foreground mb-4">
              สร้างโปรเจคแรกของคุณเพื่อเริ่มต้น
            </p>
            <Button onClick={() => setIsCreateProjectModalOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              สร้างโปรเจค
            </Button>
          </div>
        )}
      </div>

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateJob={handleCreateJob}
        projects={projects}
        selectedProjectId={selectedProjectId}
      />

      <ProjectSelector
        projects={projects}
        selectedProjectId={""}
        onSelectProject={() => {}}
        onCreateProject={handleCreateProject}
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
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
    },
  ];
}

function getAllMockJobs(): CronJob[] {
  const allJobs: CronJob[] = [];
  const projects = getMockProjects();

  projects.forEach((project) => {
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
      webhookUrl: "https://hooks.slack.com/services/XXX/YYY/ZZZ",
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
      webhookUrl: null,
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
      webhookUrl: "https://api.example.com/webhook/orders",
    },
    {
      id: "job-4",
      name: "Generate Monthly Report",
      schedule: "0 9 1 * *",
      endpoint: "https://api.example.com/generate-report",
      httpMethod: "POST",
      description:
        "Generate monthly performance report on the 1st day of each month",
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
      webhookUrl: null,
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
      webhookUrl: "https://hooks.slack.com/services/AAA/BBB/CCC",
    },
  ];

  // Return only jobs for the selected project
  return baseJobs.filter((job) => job.projectId === projectId);
}

function createMockJob(jobData: Partial<CronJob>): CronJob {
  // Store in localStorage for mock persistence
  const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");

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
  localStorage.setItem("mockJobs", JSON.stringify(mockJobs));

  return newJob as CronJob;
}

function mockToggleJobStatus(job: CronJob, newStatus: JobStatus) {
  // Update mock job in localStorage
  const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");
  const updatedJobs = mockJobs.map((j: CronJob) =>
    j.id === job.id ? { ...j, status: newStatus } : j,
  );
  localStorage.setItem("mockJobs", JSON.stringify(updatedJobs));
}

function mockDeleteJob(jobId: string) {
  // Remove mock job from localStorage
  const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");
  const updatedJobs = mockJobs.filter((j: CronJob) => j.id !== jobId);
  localStorage.setItem("mockJobs", JSON.stringify(updatedJobs));
}

function mockDeleteProject(projectId: string) {
  // Remove project and its jobs from localStorage
  const mockProjects = JSON.parse(localStorage.getItem("mockProjects") || "[]");
  const updatedProjects = mockProjects.filter(
    (p: Project) => p.id !== projectId,
  );
  localStorage.setItem("mockProjects", JSON.stringify(updatedProjects));

  // Also remove associated jobs
  const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");
  const updatedJobs = mockJobs.filter(
    (j: CronJob) => j.projectId !== projectId,
  );
  localStorage.setItem("mockJobs", JSON.stringify(updatedJobs));
}

function mockDuplicateJob(job: CronJob) {
  // Create duplicate in localStorage
  const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");

  const newJob = {
    ...job,
    id: `job-${Date.now()}`,
    name: `${job.name} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockJobs.push(newJob);
  localStorage.setItem("mockJobs", JSON.stringify(mockJobs));
}

function mockImportJob(job: Partial<CronJob>) {
  // Add imported job to localStorage
  const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");

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
  localStorage.setItem("mockJobs", JSON.stringify(mockJobs));
}

function mockImportProject(projectWithJobs: ProjectWithJobs) {
  // Add imported project to localStorage
  const mockProjects = JSON.parse(localStorage.getItem("mockProjects") || "[]");

  const newProjectId = `project-${Date.now()}`;
  const newProject = {
    id: newProjectId,
    name: projectWithJobs.name,
    description: projectWithJobs.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockProjects.push(newProject);
  localStorage.setItem("mockProjects", JSON.stringify(mockProjects));

  // Add jobs for this project
  if (projectWithJobs.jobs && projectWithJobs.jobs.length > 0) {
    const mockJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");

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

    localStorage.setItem("mockJobs", JSON.stringify(mockJobs));
  }
}

// Helper to calculate next run time based on cron expression
function getNextRunTime(cronExpression: string): string {
  // Simple implementation - just add random hours (1-24)
  const hours = Math.floor(Math.random() * 24) + 1;
  return new Date(Date.now() + hours * 3600000).toISOString();
}
