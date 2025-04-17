
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { CronJob } from "@/lib/types";
import { apiService } from "@/lib/api-service";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Play, Pause, Copy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function createMockJob(partial: Partial<CronJob>): CronJob {
  const date = new Date();
  const future = new Date();
  future.setMinutes(future.getMinutes() + 1);
  
  return {
    id: partial.id || `mock-${Date.now()}`,
    projectId: partial.projectId || "mock-project",
    name: partial.name || "Mock Job",
    description: partial.description || "This is a mock job.",
    schedule: partial.schedule || "* * * * *",
    timezone: partial.timezone || "UTC",
    endpoint: partial.endpoint || "https://example.com/webhook",
    httpMethod: partial.httpMethod || "GET",
    headers: partial.headers || {},
    body: partial.body || "",
    status: partial.status || "idle",
    createdAt: partial.createdAt || date.toISOString(),
    updatedAt: partial.updatedAt || date.toISOString(),
    lastRun: partial.lastRun || (Math.random() > 0.5 ? new Date(date.getTime() - Math.random() * 10000000).toISOString() : null),
    nextRun: partial.nextRun || (Math.random() > 0.2 ? future.toISOString() : null),
    tags: partial.tags || [],
    useLocalTime: partial.useLocalTime || false,
    emailNotifications: partial.emailNotifications || "",
    webhookUrl: partial.webhookUrl || "",
    successCount: partial.successCount || 0,
    failCount: partial.failCount || 0,
    averageRuntime: partial.averageRuntime || null,
  };
}

const ProjectJobsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!projectId) {
          throw new Error("Project ID is missing");
        }

        // In production, we would fetch from the API
        if (import.meta.env.DEV) {
          // Create 5 mock jobs for development
          const mockJobs = Array.from({ length: 5 }).map((_, i) => 
            createMockJob({
              id: `mock-${i}`,
              name: `Job ${i + 1}`,
              projectId: projectId,
              status: i % 3 === 0 ? "running" : i % 3 === 1 ? "success" : "idle",
              description: `This is a mock job ${i + 1} for development.`
            })
          );
          setJobs(mockJobs);
          setProjectName(`Project ${projectId}`);
        } else {
          // In production, use the API service
          const jobsResponse = await apiService.getJobsByProject(projectId);
          const projectResponse = await apiService.getProject(projectId);
          setJobs(jobsResponse.data || []);
          setProjectName(projectResponse.data?.name || 'Unknown Project');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load project jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, toast]);

  const handleViewDetails = (job: CronJob) => {
    console.log("View details for job:", job.id);
    // In a real app, we would navigate to a job details page or open a modal
  };

  const handleToggleStatus = (jobId: string) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const jobToToggle = jobs.find(job => job.id === jobId);
          if (jobToToggle) {
            const newStatus = jobToToggle.status === "running" ? "idle" : "running";
            // Update job status
            setJobs(jobs.map(job => 
              job.id === jobId ? { ...job, status: newStatus } : job
            ));
            
            toast({
              title: `Job ${newStatus === "running" ? "Started" : "Paused"}`,
              description: `Job "${jobToToggle.name}" has been ${newStatus === "running" ? "started" : "paused"}.`,
            });
          }
        }}
      >
        {jobs.find(job => job.id === jobId)?.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    );
  };

  const handleDeleteJob = (jobId: string) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Remove job from state
                setJobs(jobs.filter(job => job.id !== jobId));
                
                toast({
                  title: "Job Deleted",
                  description: "The job has been successfully deleted.",
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const handleDuplicateJob = (jobId: string) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const jobToDuplicate = jobs.find(job => job.id === jobId);
          if (jobToDuplicate) {
            const newJob = createMockJob({
              ...jobToDuplicate,
              id: `mock-${Date.now()}`,
              name: `${jobToDuplicate.name} (Copy)`,
              status: "idle",
            });
            
            setJobs([...jobs, newJob]);
            
            toast({
              title: "Job Duplicated",
              description: `A copy of "${jobToDuplicate.name}" has been created.`,
            });
          }
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <PageLayout title={`Jobs for ${projectName}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/jobs')}>
            Back to Projects
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading jobs...</p>
          </div>
        ) : (
          <JobsTable 
            jobs={jobs}
            onViewDetails={handleViewDetails}
            onToggleStatus={handleToggleStatus}
            onDeleteJob={handleDeleteJob}
            onDuplicateJob={handleDuplicateJob}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default ProjectJobsPage;
