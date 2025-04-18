
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ProjectBatchActions } from "@/components/ProjectBatchActions";
import { ProjectsTable } from "@/components/ProjectsTable";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { apiService } from "@/lib/api-service";
import { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectExportImport } from "@/components/ProjectExportImport";

export default function JobsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiService.getProjects().then((res) => res.data),
  });
  
  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };
  
  const handleImportProjects = (projects: Partial<Project>[]) => {
    // Handle individual project creation since createProjects doesn't exist
    const createPromises = projects.map(project => 
      apiService.createProject(project as any)
    );
    
    Promise.all(createPromises)
      .then(() => {
        refetch();
      })
      .catch((err) => {
        console.error(err);
      });
  };
  
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleExportProjects = (format: "json" | "csv") => {
    const projectsToExport = selectedProjectIds.length > 0
      ? projects.filter(p => selectedProjectIds.includes(p.id))
      : projects;

    const fileName = `projects-export-${new Date().toISOString().split("T")[0]}`;

    if (format === "json") {
      const jsonData = JSON.stringify(projectsToExport, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "ส่งออกสำเร็จ",
        description: `ส่งออกโปรเจค ${projectsToExport.length} รายการในรูปแบบ JSON`,
      });
    } else {
      const headers = ["id", "name", "description", "createdAt", "updatedAt"];
      const csvRows = [
        headers.join(","),
        ...projectsToExport.map(project => 
          headers.map(header => {
            const field = project[header as keyof Project];
            if (typeof field === "string" && field.includes(",")) {
              return `"${field}"`;
            }
            return String(field || "");
          }).join(",")
        )
      ];

      const csvData = csvRows.join("\n");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "ส่งออกสำเร็จ",
        description: `ส่งออกโปรเจค ${projectsToExport.length} รายการในรูปแบบ CSV`,
      });
    }
  };

  const handleBatchDeleteProjects = () => {
    if (selectedProjectIds.length === 0) return;

    const projectNames = selectedProjectIds.map(id => {
      const project = projects.find(p => p.id === id);
      return project ? project.name : id;
    });

    toast({
      title: "กำลังลบโปรเจค",
      description: `กำลังลบโปรเจคที่เลือก ${selectedProjectIds.length} รายการ...`,
    });

    const deletePromises = selectedProjectIds.map(projectId => 
      apiService.deleteProject(projectId)
        .then(response => {
          if (!response.success) {
            console.warn(`Failed to delete project ${projectId}`);
          }
          return response;
        })
        .catch(error => {
          console.error(`Error deleting project ${projectId}:`, error);
          return { success: false };
        })
    );

    Promise.all(deletePromises)
      .then(() => {
        toast({
          title: "ลบโปรเจคสำเร็จ",
          description: `ลบโปรเจคที่เลือกจำนวน ${selectedProjectIds.length} รายการเรียบร้อยแล้ว`,
        });
        setSelectedProjectIds([]);
        refetch();
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
    <PageLayout title="Projects">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">โปรเจค</h1>
            <p className="text-muted-foreground">
              จัดการและสร้างโปรเจคของคุณ
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              สร้างโปรเจค
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 space-y-2 md:space-y-0">
              <Input
                className="md:w-[200px]"
                placeholder="ค้นหาโปรเจค..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <ProjectSelector 
                  projects={projects} 
                  onSelectProject={handleSelectProject}
                />
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDeleteProjects}
                  className="flex items-center gap-1"
                  disabled={selectedProjectIds.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ลบ</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportProjects("json")}
                  className="flex items-center gap-1"
                >
                  <span>ส่งออก</span>
                </Button>
              </div>
            </div>
          </div>

          <ProjectsTable
            projects={projects}
            onDeleteProject={id => apiService.deleteProject(id).then(() => refetch())}
            onViewJobs={id => console.log("View jobs for project", id)}
            selectedProjectId={selectedProject?.id || null}
            selectedProjectIds={selectedProjectIds}
            setSelectedProjectIds={setSelectedProjectIds}
          />
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={(projectData) => {
          apiService
            .createProject(projectData)
            .then(() => {
              refetch();
              setIsCreateModalOpen(false);
            })
            .catch((err) => {
              console.error(err);
            });
        }}
      />
    </PageLayout>
  );
}
