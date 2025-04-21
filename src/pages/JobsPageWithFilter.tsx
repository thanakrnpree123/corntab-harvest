import { useState, useMemo } from "react";
import { ProjectsTable } from "@/components/ProjectsTable";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/lib/types";

interface JobsPageWithFilterProps {
  allProjects: Project[];
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  selectedProjectId: string | null;
  selectedProjectIds: string[];
  onSelectProject: (projectId: string, checked: boolean) => void;
  onSelectAllProjects: (checked: boolean) => void;
}

export function JobsPageWithFilter({
  allProjects,
  onAddJob,
  onDeleteProject,
  onViewJobs,
  selectedProjectId,
  selectedProjectIds,
  onSelectProject,
  onSelectAllProjects,
}: JobsPageWithFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allProjects]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="ค้นหาโปรเจค..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-sm"
      />

      <Card>
        <CardContent className="p-0">
          <ProjectsTable
            projects={filteredProjects}
            onAddJob={onAddJob}
            onDeleteProject={onDeleteProject}
            onViewJobs={onViewJobs}
            selectedProjectId={selectedProjectId}
            selectedProjectIdsPops={selectedProjectIds}
            onSelectProject={onSelectProject}
            onSelectAllProjects={onSelectAllProjects}
          />
        </CardContent>
      </Card>
    </div>
  );
}
