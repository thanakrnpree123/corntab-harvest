
import { CronJob, Project } from "@/lib/types";
import { JobListItem,ListHeader } from "@/components/JobListItem";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentJobsListProps {
  jobs: CronJob[];
  selectedJobId: string | null;
  setSelectedJobId: (id: string) => void;
  projects: Project[];
  searchMsg?: string;
}

export function RecentJobsList({
  jobs,
  selectedJobId,
  setSelectedJobId,
  projects,
  searchMsg = "No jobs have run yet"
}: RecentJobsListProps) {
  const navigate = useNavigate();
  const hasMore = jobs.length > 10;
  const showJobs = jobs.slice(0, 5);

  if (jobs.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        {searchMsg}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full divide-y">
      <ListHeader />
      <div className="overflow-y-auto max-h-[500px]">
        {showJobs.map((job, idx) => (
          <div key={job.id} className="flex-0">
            <JobListItem
              job={job}
              projectName={projects.find(p => p.id === job.projectId)?.name}
              isSelected={job.id === selectedJobId}
              onSelect={() => setSelectedJobId(job.id)}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="flex flex-col items-center justify-center p-2">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => navigate("/logs")}
          >
            ดูเพิ่มเติม
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
  

  // return (
  //   <div className="flex flex-col h-full divide-y overflow-y-auto">
  //     {showJobs.map((job, idx) => (
  //       <div key={job.id} className="flex-0">
  //         <JobListItem
  //           job={job}
  //           projectName={projects.find(p => p.id === job.projectId)?.name}
  //           isSelected={job.id === selectedJobId}
  //           onSelect={() => setSelectedJobId(job.id)}
  //         />
  //       </div>
  //     ))}
  //     {hasMore && (
  //       <div className="flex flex-col items-center justify-center p-2">
  //         <Button
  //           variant="ghost"
  //           className="w-full text-muted-foreground"
  //           onClick={() => navigate("/logs")}
  //         >
  //           ดูเพิ่มเติม
  //           <ChevronRight className="h-4 w-4 ml-1" />
  //         </Button>
  //       </div>
  //     )}
  //   </div>
  // );
}