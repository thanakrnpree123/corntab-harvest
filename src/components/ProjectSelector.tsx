
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project } from "@/lib/types";
import { PlusCircle, Loader2 } from "lucide-react";

export interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  compact?: boolean;
  isLoading?: boolean;
}

export function ProjectSelector({ 
  projects, 
  selectedProjectId, 
  onSelectProject, 
  onCreateProject,
  compact = false,
  isLoading = false
}: ProjectSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    
    onCreateProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined
    });
    
    // Reset form and close dialog
    setNewProjectName("");
    setNewProjectDescription("");
    setIsDialogOpen(false);
    setIsCreating(false);
  };

  return (
    <div className={`flex items-center ${compact ? 'md:w-auto' : 'w-full md:w-1/3'} flex-col md:flex-row gap-2`}>
      <div className={`w-full ${compact ? '' : 'md:w-80'} mr-2`}>
        {isLoading ? (
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Loading projects...</span>
          </div>
        ) : (
          <Select value={selectedProjectId} onValueChange={onSelectProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              ) : (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  No projects found
                </div>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new project.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="Project Name"
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Project Description (Optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={!newProjectName.trim() || isCreating}
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
