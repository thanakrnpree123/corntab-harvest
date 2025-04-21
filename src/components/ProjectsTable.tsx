
import { Project, CronJob } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { useNavigate } from "react-router-dom";
import { JobDetails } from "./JobDetails";
import { ProjectRow } from "./ProjectRow";
import { ProjectJobsList } from "./ProjectJobsList";

interface ProjectsTableProps {
  projects: Project[];
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  selectedProjectId: string | null;
  selectedProjectIdsPops: string[];
  onSelectProject: (projectId: string, checked: boolean) => void;
  onSelectAllProjects: (checked: boolean) => void;
}

export function ProjectsTable({
  projects,
  onAddJob,
  onDeleteProject,
  onViewJobs,
  selectedProjectId,
  selectedProjectIdsPops,
  onSelectProject,
  onSelectAllProjects,
}: ProjectsTableProps) {
  const navigate = useNavigate();
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [projectJobs, setProjectJobs] = useState<Record<string, CronJob[]>>({});
  const [loadingJobs, setLoadingJobs] = useState<Record<string, boolean>>({});
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    const loadAllProjectJobs = async () => {
      const initialLoadingState: Record<string, boolean> = {};
      projects.forEach((project) => {
        initialLoadingState[project.id] = true;
      });
      setLoadingJobs(initialLoadingState);

      try {
        const jobPromises = projects.map((project) =>
          apiService
            .getJobsByProject(project.id)
            .then((response) => {
              if (response.success && response.data) {
                return { projectId: project.id, jobs: response.data };
              }
              return { projectId: project.id, jobs: [] };
            })
            .catch(() => {
              return { projectId: project.id, jobs: [] };
            }),
        );

        const results = await Promise.all(jobPromises);

        const newProjectJobs: Record<string, CronJob[]> = {};
        results.forEach((result) => {
          newProjectJobs[result.projectId] = result.jobs;
          setLoadingJobs((prev) => ({ ...prev, [result.projectId]: false }));
        });

        setProjectJobs(newProjectJobs);
      } catch (error) {
        console.error("Error loading project jobs:", error);
        const resetLoadingState: Record<string, boolean> = {};
        projects.forEach((project) => {
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
          description: `โหลดงานทั้งหมดของโปรเจค ${projects.find((p) => p.id === projectId)?.name || projectId} เรียบร้อยแล้ว`,
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

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={
                  projects.length > 0 &&
                  selectedProjectIdsPops.length === projects.length
                }
                onCheckedChange={onSelectAllProjects}
                disabled={projects.length === 0}
              />
            </TableHead>
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
                colSpan={5}
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
                  <ProjectRow 
                    project={project}
                    isSelected={selectedProjectIdsPops.includes(project.id)}
                    onSelect={onSelectProject}
                    isOpen={isOpen}
                    isLoading={isLoading}
                    jobCount={jobCount}
                    onViewProjectJobs={handleViewProjectJobList}
                  />

                  <CollapsibleContent className="contents">
                    <TableRow>
                      <TableCell colSpan={5} className="p-0 border-t-0">
                        <div className="bg-muted/20 px-4 py-2">
                          <div className="p-2">
                            <ProjectJobsList 
                              jobs={jobs}
                              isLoading={isLoading}
                              onViewJobDetails={handleViewJobDetails}
                            />
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
