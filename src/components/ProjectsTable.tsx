import { Project } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { JobsCount } from "@/components/ui/jobs-count";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export interface ProjectsTableProps {
  projects: Project[];
  onViewDetails: (project: Project) => void;
  onSelect?: (projectId: string, checked: boolean) => void;
  selectedIds?: string[];
}

export function ProjectsTable({ 
  projects, 
  onViewDetails, 
  onSelect,
  selectedIds = [] 
}: ProjectsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelect && (
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={projects.length > 0 && selectedIds.length === projects.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      projects.forEach(project => onSelect(project.id, true));
                    } else {
                      projects.forEach(project => onSelect(project.id, false));
                    }
                  }}
                  disabled={projects.length === 0}
                  aria-label="Select all projects"
                />
              </TableHead>
            )}
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden md:table-cell">Jobs</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onSelect ? 6 : 5} className="h-24 text-center">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewDetails(project)}
              >
                {onSelect && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(project.id)}
                      onCheckedChange={(checked) => onSelect(project.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {project.name}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {project.description || "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <JobsCount projectId={project.id} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {dayjs(project.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(project);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
