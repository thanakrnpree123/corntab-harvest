
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { ProjectSelector } from "@/components/ProjectSelector";
import { CronJob, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const { toast } = useToast();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          if (response.data.length > 0 && !selectedProjectId) {
            setSelectedProjectId(response.data[0].id);
          }
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching projects",
          description: "There was an error loading your projects. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Fetch jobs based on selected project
  const { 
    data: jobs = [], 
    isLoading: isLoadingJobs, 
    refetch: refetchJobs 
  } = useQuery({
    queryKey: ['jobs', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];

      try {
        const response = await apiService.getJobsByProject(selectedProjectId);
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching jobs",
          description: "There was an error loading your jobs. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedProjectId
  });

  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    apiService.createProject(projectData)
      .then(response => {
        if (response.success && response.data) {
          setSelectedProjectId(response.data.id);
          toast.success(`Project "${projectData.name}" was created successfully`);
        } else {
          toast.error(`Failed to create project: ${response.error}`);
        }
      })
      .catch(error => {
        toast.error(`Error creating project: ${error.message}`);
      });
  };

  const handleCreateJob = (jobData: Partial<CronJob>) => {
    const newJobData = {
      ...jobData,
      projectId: selectedProjectId
    };

    apiService.createJob(newJobData)
      .then(response => {
        if (response.success && response.data) {
          toast.success(`Job "${jobData.name}" was created successfully`);
          refetchJobs();
        } else {
          toast.error(`Failed to create job: ${response.error}`);
        }
      })
      .catch(error => {
        toast.error(`Error creating job: ${error.message}`);
      });
  };

  const handleViewJobDetails = (job: CronJob) => {
    setSelectedJob(job);
    setIsDetailSheetOpen(true);
  };

  const toggleJobStatus = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newStatus = job.status === "paused" ? "idle" : "paused";
    
    apiService.updateJob(jobId, { status: newStatus })
      .then(response => {
        if (response.success) {
          if (newStatus === "paused") {
            toast({
              title: "Job Paused",
              description: `${job.name} has been paused`,
              variant: "default",
            });
          } else {
            toast({
              title: "Job Activated",
              description: `${job.name} is now active`,
              variant: "default",
            });
          }
          refetchJobs();
        } else {
          toast.error(`Failed to update job status: ${response.error}`);
        }
      })
      .catch(error => {
        toast.error(`Error updating job status: ${error.message}`);
      });
  };

  return (
    <PageLayout title="Jobs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateProject={handleCreateProject}
          />
          
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Add New Job
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center p-8">
                <span className="text-muted-foreground">Loading jobs...</span>
              </div>
            ) : (
              <JobsTable 
                jobs={jobs} 
                onViewDetails={handleViewJobDetails} 
                onToggleStatus={toggleJobStatus}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreateJob={handleCreateJob}
        projects={projects}
        selectedProjectId={selectedProjectId}
      />
      
      <JobDetails 
        job={selectedJob} 
        isOpen={isDetailSheetOpen} 
        onClose={() => setIsDetailSheetOpen(false)} 
      />
    </PageLayout>
  );
}
