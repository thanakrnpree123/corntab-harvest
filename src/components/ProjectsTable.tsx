
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
import { PlusCircle, Trash2, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

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

  const handleViewJobs = (projectId: string) => {
    // Navigate to the project jobs page
    navigate(`/jobs/${projectId}`);
    // Also call the onViewJobs function for any other needed state updates
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
              
              return (
                <TableRow 
                  key={project.id} 
                  className={isSelected ? "bg-muted/50" : ""}
                  onClick={() => handleViewJobs(project.id)}
                >
                  <TableCell className="font-medium cursor-pointer">
                    {project.name}
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
                        <PlusCircle className="h-4 w-4 mr-2" />
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
                          handleViewJobs(project.id);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
