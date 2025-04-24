
import { CronJob, Project } from "@/lib/types";
import { JobListItem, ListHeader } from "@/components/JobListItem";

export function RecentJobsList({
  jobs,
  selectedJobId,
  setSelectedJobId,
  projects,
  searchMsg,
}: {
  jobs: CronJob[];
  selectedJobId: string | null;
  setSelectedJobId: (id: string) => void;
  projects: Project[];
  searchMsg: string;
}) {
  if (jobs.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">{searchMsg}</div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ListHeader />
      {jobs.map((job) => (
        <JobListItem
          key={job.id}
          job={job}
          projectName={projects.find((p) => p.id === job.projectId)?.name}
          isSelected={job.id === selectedJobId}
          onSelect={() => setSelectedJobId(job.id)}
        />
      ))}
    </div>
  );
}
