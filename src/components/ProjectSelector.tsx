
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, FolderCog } from "lucide-react";
import { Project } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
}

export function ProjectSelector({ 
  projects, 
  selectedProjectId, 
  onSelectProject,
  onCreateProject
}: ProjectSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    onCreateProject({
      name: projectName,
      description: projectDescription
    });

    setProjectName("");
    setProjectDescription("");
    setIsCreateDialogOpen(false);
    toast.success("Project created successfully");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 min-w-[240px]">
        <FolderCog className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedProjectId} onValueChange={onSelectProject}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Projects</SelectLabel>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="gap-1" 
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className="h-4 w-4" /> New
      </Button>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your jobs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Project"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Optional project description"
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
