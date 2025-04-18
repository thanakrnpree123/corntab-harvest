
import { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";

interface ProjectsTableProps {
  projects: Project[];
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  selectedProjectId?: string;
  selectedProjectIds?: string[];
  onSelectProject?: (projectId: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
}

export function ProjectsTable({
  projects,
  onAddJob,
  onDeleteProject,
  onViewJobs,
  selectedProjectId,
  selectedProjectIds = [],
  onSelectProject,
  onSelectAll,
}: ProjectsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {onSelectProject && (
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={projects.length > 0 && selectedProjectIds.length === projects.length}
                onCheckedChange={(checked) => onSelectAll?.(checked === true)}
                aria-label="Select all projects"
              />
            </TableHead>
          )}
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id} className={selectedProjectId === project.id ? "bg-muted/50" : undefined}>
            {onSelectProject && (
              <TableCell>
                <Checkbox 
                  checked={selectedProjectIds.includes(project.id)}
                  onCheckedChange={(checked) => onSelectProject(project.id, checked === true)}
                  aria-label={`Select project ${project.name}`}
                />
              </TableCell>
            )}
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>{project.description}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewJobs(project.id)}
                >
                  View Jobs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddJob(project.id)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
