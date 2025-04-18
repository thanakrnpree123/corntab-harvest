
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";
import dayjs from "dayjs";

export interface ProjectsTableProps {
  projects: Project[];
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  selectedProjectId: string;
  onSelectProjects?: (projectIds: string[]) => void;
  selectedProjectIds?: string[];
}

export function ProjectsTable({
  projects,
  onAddJob,
  onDeleteProject,
  onViewJobs,
  selectedProjectId,
  onSelectProjects,
  selectedProjectIds = [],
}: ProjectsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectProjects) {
      onSelectProjects(checked ? projects.map(p => p.id) : []);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (onSelectProjects) {
      onSelectProjects(
        checked 
          ? [...selectedProjectIds, projectId]
          : selectedProjectIds.filter(id => id !== projectId)
      );
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {onSelectProjects && (
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={projects.length > 0 && selectedProjectIds.length === projects.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all projects"
              />
            </TableHead>
          )}
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead className="hidden md:table-cell">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell 
              colSpan={onSelectProjects ? 5 : 4} 
              className="text-center py-6 text-muted-foreground"
            >
              No projects found
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project) => (
            <TableRow 
              key={project.id}
              className={project.id === selectedProjectId ? "bg-muted/50" : undefined}
            >
              {onSelectProjects && (
                <TableCell>
                  <Checkbox 
                    checked={selectedProjectIds.includes(project.id)}
                    onCheckedChange={(checked) => handleSelectProject(project.id, checked === true)}
                    aria-label={`Select project ${project.name}`}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">
                <div 
                  className="cursor-pointer hover:underline"
                  onClick={() => onViewJobs(project.id)}
                >
                  {project.name}
                </div>
                <div className="text-xs text-muted-foreground md:hidden">
                  {project.description}
                </div>
                {project.id === selectedProjectId && (
                  <div className="text-xs text-primary mt-1">Currently selected</div>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {project.description}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {dayjs(project.createdAt).format("MMM DD, YYYY")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddJob(project.id)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
