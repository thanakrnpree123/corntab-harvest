
import { Project, CronJob } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, ChevronRight, ChevronDown, Container, ChevronUp, Play, Pause, Copy, Edit } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { JobsTable } from "./JobsTable";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectsTableProps {
  projects: Project[];
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  selectedProjectId: string | null;
}

export function ProjectsTable({
  projects,
  onAddJob,
  onDeleteProject,
  onViewJobs,
  selectedProjectId
}: ProjectsTableProps) {
  const navigate = useNavigate();
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [projectJobs, setProjectJobs] = useState<Record<string, CronJob[]>>({});
  const [loadingJobs, setLoadingJobs] = useState<Record<string, boolean>>({});

  const handleViewJobs = async (projectId: string) => {
    // Toggle the collapse state
    setOpenProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
    
    // Call the onViewJobs function for any other needed state updates
    onViewJobs(projectId);

    // Fetch jobs for this project if needed and if opening
    if (!openProjects[projectId] && !projectJobs[projectId]) {
      await fetchJobsForProject(projectId);
    }
  };

  const fetchJobsForProject = async (projectId: string) => {
    setLoadingJobs(prev => ({ ...prev, [projectId]: true }));
    
    try {
      const response = await apiService.getJobsByProject(projectId);
      
      if (response.success && response.data) {
        setProjectJobs(prev => ({
          ...prev,
          [projectId]: response.data
        }));
      } else {
        toast.error("Failed to load jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoadingJobs(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleToggleJobStatus = (jobId: string) => {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={(e) => {
          e.stopPropagation();
          toast.info("Status toggle functionality would go here");
        }}
      >
        <Play className="h-3 w-3 mr-1" />
        เริ่มทำงาน
      </Button>
    );
  };

  const handleDeleteJob = (jobId: string) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive h-8"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            ลบ
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบงาน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบงานนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.info("Delete job functionality would go here");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบงาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const handleDuplicateJob = (jobId: string) => {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={(e) => {
          e.stopPropagation();
          toast.info("Duplicate job functionality would go here");
        }}
      >
        <Copy className="h-3 w-3 mr-1" />
        คัดลอก
      </Button>
    );
  };

  const handleEditJob = (jobId: string) => {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={(e) => {
          e.stopPropagation();
          toast.info("Edit job functionality would go here");
        }}
      >
        <Edit className="h-3 w-3 mr-1" />
        แก้ไข
      </Button>
    );
  };

  const handleViewJobDetails = (job: CronJob) => {
    navigate(`/jobs/${job.projectId}/${job.id}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">ชื่อโปรเจค</TableHead>
            <TableHead className="hidden md:table-cell w-[35%]">รายละเอียด</TableHead>
            <TableHead className="hidden md:table-cell w-[15%]">วันที่สร้าง</TableHead>
            <TableHead className="text-right w-[20%]">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                ไม่พบโปรเจค
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              const isOpen = openProjects[project.id] || false;
              const isLoading = loadingJobs[project.id] || false;
              const jobs = projectJobs[project.id] || [];

              return (
                <Collapsible
                  key={project.id}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setOpenProjects(prev => ({
                      ...prev,
                      [project.id]: open
                    }));
                    if (open && !projectJobs[project.id]) {
                      fetchJobsForProject(project.id);
                    }
                  }}
                  className="w-full"
                >
                  <TableRow
                    className={`${isSelected ? "bg-muted/50" : ""} cursor-pointer hover:bg-muted/40 transition-colors`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2" onClick={() => handleViewJobs(project.id)}>
                        <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.description || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dayjs(project.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddJob(project.id)}
                        >
                          <Container className="h-4 w-4 mr-2" />
                          เพิ่มงาน
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              ลบ
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ลบโปรเจค</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณต้องการลบโปรเจค "{project.name}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                                งานทั้งหมดภายในโปรเจคนี้จะถูกลบด้วย
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteProject(project.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                ลบโปรเจค
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${project.id}`);
                          }}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent>
                    <TableRow>
                      <TableCell colSpan={4} className="p-0 border-t-0">
                        <div className="bg-muted/20 px-4 py-2">
                          <div className="p-2">
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-sm font-medium">งานในโปรเจคนี้</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/jobs/${project.id}`)}
                              >
                                ดูทั้งหมด
                              </Button>
                            </div>
                            
                            {isLoading ? (
                              <p className="text-muted-foreground text-sm py-4 text-center">
                                กำลังโหลดรายการงาน...
                              </p>
                            ) : jobs.length === 0 ? (
                              <p className="text-muted-foreground text-sm py-4 text-center">
                                ไม่พบงานในโปรเจคนี้
                              </p>
                            ) : (
                              <ScrollArea className="max-h-[500px]">
                                <div className="overflow-x-auto">
                                  <Table className="w-full min-w-[600px]">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[35%]">ชื่องาน</TableHead>
                                        <TableHead className="hidden md:table-cell w-[25%]">ตารางเวลา</TableHead>
                                        <TableHead className="w-[15%]">สถานะ</TableHead>
                                        <TableHead className="text-right w-[25%]">การจัดการ</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {jobs.map((job) => (
                                        <TableRow
                                          key={job.id}
                                          className="cursor-pointer hover:bg-muted/40"
                                          onClick={() => handleViewJobDetails(job)}
                                        >
                                          <TableCell>
                                            <div className="font-medium">{job.name}</div>
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
                                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                              {job.status}
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-wrap justify-end gap-2">
                                              {handleToggleJobStatus(job.id)}
                                              {handleEditJob(job.id)}
                                              {handleDuplicateJob(job.id)}
                                              {handleDeleteJob(job.id)}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </ScrollArea>
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
    </div>
  );
}
