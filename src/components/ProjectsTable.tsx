import { Project, CronJob, JobStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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
import {
  Trash2,
  ChevronRight,
  ChevronDown,
  Container,
  ChevronUp,
  Play,
  Pause,
  Copy,
  Edit,
  EllipsisVertical,
  Calendar,
  Clipboard,
} from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/api-service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { JobDetails } from "./JobDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectBatchActions } from "./ProjectBatchActions";

interface ProjectsTableProps {
  projects: Project[];
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  onBatchExportProjects?: (projectIds: string[], format: "json" | "csv") => void;
  onBatchDeleteProjects?: (projectIds: string[]) => void;
  selectedProjectId: string | null;
}

export function ProjectsTable({
  projects,
  onAddJob,
  onDeleteProject,
  onViewJobs,
  onBatchExportProjects,
  onBatchDeleteProjects,
  selectedProjectId,
}: ProjectsTableProps) {
  const navigate = useNavigate();
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [projectJobs, setProjectJobs] = useState<Record<string, CronJob[]>>({});
  const [loadingJobs, setLoadingJobs] = useState<Record<string, boolean>>({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    const loadAllProjectJobs = async () => {
      const initialLoadingState: Record<string, boolean> = {};
      projects.forEach(project => {
        initialLoadingState[project.id] = true;
      });
      setLoadingJobs(initialLoadingState);
      
      try {
        const jobPromises = projects.map(project => 
          apiService.getJobsByProject(project.id)
            .then(response => {
              if (response.success && response.data) {
                return { projectId: project.id, jobs: response.data };
              }
              return { projectId: project.id, jobs: [] };
            })
            .catch(() => {
              return { projectId: project.id, jobs: [] };
            })
        );
        
        const results = await Promise.all(jobPromises);
        
        const newProjectJobs: Record<string, CronJob[]> = {};
        results.forEach(result => {
          newProjectJobs[result.projectId] = result.jobs;
          setLoadingJobs(prev => ({ ...prev, [result.projectId]: false }));
        });
        
        setProjectJobs(newProjectJobs);
        
      } catch (error) {
        console.error("Error loading project jobs:", error);
        const resetLoadingState: Record<string, boolean> = {};
        projects.forEach(project => {
          resetLoadingState[project.id] = false;
        });
        setLoadingJobs(resetLoadingState);
      }
    };

    if (projects.length > 0) {
      loadAllProjectJobs();
    }
  }, [projects]);

  useEffect(() => {
    setSelectedProjectIds([]);
  }, [projects]);

  const fetchJobsForProject = async (projectId: string) => {
    if (projectJobs[projectId] && projectJobs[projectId].length > 0) {
      return;
    }
    
    setLoadingJobs((prev) => ({ ...prev, [projectId]: true }));
    try {
      const response = await apiService.getJobsByProject(projectId);
      if (response.success && response.data) {
        setProjectJobs((prev) => ({ ...prev, [projectId]: response.data }));
        toast({
          title: "โหลดงานสำเร็จ",
          description: `โหลดงานทั้งหมดของโปรเจค ${projects.find(p => p.id === projectId)?.name || projectId} เรียบร้อยแล้ว`,
        });
      } else {
        toast({
          title: "ไม่สามารถโหลดงานได้",
          description: "เกิดข้อผิดพลาดในการโหลดงาน",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "ไม่สามารถโหลดงานได้",
        description: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
        variant: "destructive",
      });
    } finally {
      setLoadingJobs((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  const handleViewJobDetails = (job: CronJob) => {
    setSelectedJob(job);
    setIsDetailSheetOpen(true);
  };

  const handleViewProjectJobList = (projectId: string) => {
    navigate(`/jobs/${projectId}`);
  };

  const handleEditJob = (job: CronJob) => {
    toast({
      title: "แก้ไขงาน",
      description: `กำลังเปิดหน้าแก้ไขงาน "${job.name}"`,
    });
    // Implement edit functionality
  };

  const handleDeleteJob = (job: CronJob) => {
    toast({
      title: "ลบงานสำเร็จ",
      description: `งาน "${job.name}" ถูกลบเรียบร้อยแล้ว`,
    });
    // Refresh jobs after deletion
    if (job.projectId) {
      fetchJobsForProject(job.projectId);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(projects.map(project => project.id));
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

  const handleBatchExport = (projectIds: string[], format: "json" | "csv") => {
    if (onBatchExportProjects) {
      onBatchExportProjects(projectIds, format);
      toast({
        title: "ส่งออกโปรเจค",
        description: `กำลังส่งออกโปรเจคทั้งหมด ${projectIds.length} โปรเจค`,
      });
    }
  };

  const handleBatchDelete = (projectIds: string[]) => {
    if (onBatchDeleteProjects) {
      onBatchDeleteProjects(projectIds);
      setSelectedProjectIds([]);
      toast({
        title: "ลบโปรเจค",
        description: `ลบโปรเจคทั้งหมด ${projectIds.length} โปรเจคเรียบร้อยแล้ว`,
      });
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {(onBatchExportProjects || onBatchDeleteProjects) && (
        <div className="mb-4">
          <ProjectBatchActions
            projects={projects}
            selectedProjectIds={selectedProjectIds}
            onExport={handleBatchExport}
            onDelete={handleBatchDelete}
            disabled={projects.length === 0}
          />
        </div>
      )}
      
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {(onBatchExportProjects || onBatchDeleteProjects) && (
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={projects.length > 0 && selectedProjectIds.length === projects.length} 
                  onCheckedChange={handleSelectAll}
                  disabled={projects.length === 0}
                  aria-label="Select all projects"
                />
              </TableHead>
            )}
            <TableHead className="w-[30%]">ชื่อโปรเจค</TableHead>
            <TableHead className="hidden md:table-cell w-[30%]">
              รายละเอียด
            </TableHead>
            <TableHead className="hidden md:table-cell w-[15%]">
              วันที่สร้าง
            </TableHead>
            <TableHead className="hidden md:table-cell w-[15%]">
              จำนวนงาน
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={(onBatchExportProjects || onBatchDeleteProjects) ? 5 : 4}
                className="text-center py-6 text-muted-foreground"
              >
                ไม่พบโปรเจค
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              const isOpen = openProjects[project.id] || false;
              const isLoading = loadingJobs[project.id] || false;
              const jobs = projectJobs[project.id] || [];
              const jobCount = jobs.length;

              return (
                <Collapsible
                  key={project.id}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setOpenProjects((prev) => ({
                      ...prev,
                      [project.id]: open,
                    }));
                    if (open && !projectJobs[project.id]) {
                      fetchJobsForProject(project.id);
                    }
                    onViewJobs(project.id);
                  }}
                  className="contents"
                >
                  <TableRow
                    className={`${isSelected ? "bg-muted/50" : ""} cursor-pointer hover:bg-muted/40 transition-colors`}
                  >
                    {(onBatchExportProjects || onBatchDeleteProjects) && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedProjectIds.includes(project.id)} 
                          onCheckedChange={(checked) => handleSelectProject(project.id, checked === true)}
                          aria-label={`Select project ${project.name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      <div
                        className="flex items-center gap-2"
                        onClick={() => {
                          handleViewProjectJobList(project.id);
                          toast({
                            title: "เปิดโปรเจค",
                            description: `กำลังดูรายละเอียดโปรเจค "${project.name}"`,
                          });
                        }}
                      >
                        <CollapsibleTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                          >
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell truncate">
                      {project.description || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {dayjs(project.createdAt).format("DD/MM/YYYY")}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clipboard className="h-4 w-4 text-muted-foreground" />
                        {isLoading ? (
                          <span className="text-muted-foreground text-sm">กำลังโหลด...</span>
                        ) : (
                          <Badge variant="outline" className="text-xs font-normal">
                            {jobCount} งาน
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  <CollapsibleContent className="contents">
                    <TableRow>
                      <TableCell colSpan={(onBatchExportProjects || onBatchDeleteProjects) ? 5 : 4} className="p-0 border-t-0">
                        <div className="bg-muted/20 px-4 py-2">
                          <div className="p-2">
                            {isLoading ? (
                              <p className="text-muted-foreground text-sm py-4 text-center">
                                กำลังโหลดรายการงาน...
                              </p>
                            ) : jobs.length === 0 ? (
                              <p className="text-muted-foreground text-sm py-4 text-center">
                                ไม่พบงานในโปรเจคนี้
                              </p>
                            ) : (
                              <div className="max-h-[400px] overflow-auto">
                                <Table className="w-full table-fixed">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[35%] truncate">
                                        ชื่องาน
                                      </TableHead>
                                      <TableHead className="hidden md:table-cell w-[25%] truncate">
                                        ตารางเวลา
                                      </TableHead>
                                      <TableHead className="w-[15%] truncate">
                                        สถานะ
                                      </TableHead>
                                      <TableHead className="text-right w-[25%] truncate">
                                        การจัดการ
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {jobs.map((job) => (
                                      <TableRow
                                        key={job.id}
                                        className="cursor-pointer hover:bg-muted/40"
                                        onClick={() => {
                                          handleViewJobDetails(job);
                                          toast({
                                            title: "ดูรายละเอียดงาน",
                                            description: `กำลังดูรายละเอียดของงาน "${job.name}"`,
                                          });
                                        }}
                                      >
                                        <TableCell>
                                          <div className="font-medium truncate">
                                            {job.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground md:hidden">
                                            {job.schedule}
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          <code className="bg-muted text-xs px-1 py-0.5 rounded">
                                            {job.schedule}
                                          </code>
                                        </TableCell>
                                        <TableCell>
                                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                            <StatusBadge status={job.status} />
                                          </div>
                                        </TableCell>
                                        <TableCell
                                          className="text-right"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="flex justify-end items-center gap-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdownId((prev) =>
                                                  prev === job.id
                                                    ? null
                                                    : job.id,
                                                );
                                              }}
                                              className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                                            >
                                              <EllipsisVertical
                                                color="#000000"
                                                strokeWidth={0.75}
                                              />
                                            </button>

                                            {openDropdownId === job.id && (
                                              <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-50">
                                                <div className="py-1 w-32">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleEditJob(job);
                                                      setOpenDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                                  >
                                                    Edit
                                                  </button>
                                                  <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setOpenDropdownId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                                                      >
                                                        Delete
                                                      </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                      <AlertDialogHeader>
                                                        <AlertDialogTitle>ลบงาน</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                          คุณต้องการลบงาน "{job.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
                                                        </AlertDialogDescription>
                                                      </AlertDialogHeader>
                                                      <AlertDialogFooter>
                                                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                        <AlertDialogAction
                                                          onClick={() => handleDeleteJob(job)}
                                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                          ลบงาน
                                                        </AlertDialogAction>
                                                      </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                  </AlertDialog>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </TableBody>
      </Table>
      <JobDetails
        job={selectedJob}
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          toast({
            title: "ปิดรายละเอียด",
            description: "ปิดหน้ารายละเอียดงานแล้ว",
          });
        }}
      />
    </div>
  );
}
