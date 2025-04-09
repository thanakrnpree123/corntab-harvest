
import { Project } from "@/lib/types";
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
import { Trash2, ChevronRight, ChevronDown, Container, ChevronUp } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

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

  const handleViewJobs = (projectId: string) => {
    // Toggle the collapse state
    setOpenProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
    
    // Call the onViewJobs function for any other needed state updates
    onViewJobs(projectId);
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">ชื่อโปรเจค</TableHead>
            <TableHead className="hidden md:table-cell">รายละเอียด</TableHead>
            <TableHead className="hidden md:table-cell">วันที่สร้าง</TableHead>
            <TableHead className="text-right">การจัดการ</TableHead>
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

              return (
                <Collapsible
                  key={project.id}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setOpenProjects(prev => ({
                      ...prev,
                      [project.id]: open
                    }));
                    if (open) {
                      onViewJobs(project.id);
                    }
                  }}
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
                          // onClick={() => onAddJob(project.id)}
                          disabled
                        >
                          <Container className="h-4 w-4 mr-2" />
                          {10}
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
                            <p className="text-muted-foreground text-sm">
                              {isOpen ? "กำลังโหลดรายการงาน..." : ""}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">งานในโปรเจคนี้</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/jobs/${project.id}`)}
                              >
                                ดูทั้งหมด
                              </Button>
                            </div>
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
