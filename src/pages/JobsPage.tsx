
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobExportImport } from "@/components/JobExportImport";
import { CronJob, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, PlusCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function JobsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobActionInProgress, setIsJobActionInProgress] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  // Fetch projects
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      setIsProjectLoading(true);
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
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
      } finally {
        setIsProjectLoading(false);
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

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.name.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query) ||
      job.endpoint.toLowerCase().includes(query)
    );
  });

  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    apiService.createProject(projectData)
      .then(response => {
        if (response.success && response.data) {
          setSelectedProjectId(response.data.id);
          toast({
            title: "Success",
            description: `Project "${projectData.name}" was created successfully`,
          });
          refetchProjects();
        } else {
          toast({
            title: "Error",
            description: `Failed to create project: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Error creating project: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handleCreateJob = (jobData: Partial<CronJob>) => {
    const newJobData = {
      ...jobData,
      projectId: selectedProjectId,
      name: jobData.name || "",
      schedule: jobData.schedule || "",
      endpoint: jobData.endpoint || "",
      httpMethod: jobData.httpMethod || "GET",
    };

    apiService.createJob(newJobData)
      .then(response => {
        if (response.success && response.data) {
          toast({
            title: "Success",
            description: `Job "${jobData.name}" was created successfully`,
          });
          refetchJobs();
        } else {
          toast({
            title: "Error",
            description: `Failed to create job: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Error creating job: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handleViewJobDetails = (job: CronJob) => {
    setSelectedJob(job);
    setIsDetailSheetOpen(true);
  };

  const toggleJobStatus = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));
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
          toast({
            title: "Error",
            description: `Failed to update job status: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Error updating job status: ${error.message}`,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDeleteJob = (jobId: string) => {
    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));

    apiService.deleteJob(jobId)
      .then(response => {
        if (response.success) {
          toast({
            title: "Success",
            description: "Job deleted successfully",
          });
          refetchJobs();
        } else {
          toast({
            title: "Error",
            description: `Failed to delete job: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Error deleting job: ${error.message}`,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleDuplicateJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setIsJobActionInProgress(prev => ({ ...prev, [jobId]: true }));
    
    apiService.duplicateJob(jobId)
      .then(response => {
        if (response.success && response.data) {
          toast({
            title: "Success",
            description: `Job "${job.name}" was duplicated successfully`,
          });
          refetchJobs();
        } else {
          toast({
            title: "Error",
            description: `Failed to duplicate job: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Error duplicating job: ${error.message}`,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsJobActionInProgress(prev => ({ ...prev, [jobId]: false }));
      });
  };

  const handleImportJobs = (importedJobs: Partial<CronJob>[]) => {
    // Add the current projectId to all imported jobs
    const jobsWithProject = importedJobs.map(job => ({
      ...job,
      projectId: selectedProjectId
    }));
    
    let successCount = 0;
    let failCount = 0;
    
    // Create each job one by one
    const createPromises = jobsWithProject.map(job => 
      apiService.createJob(job)
        .then(response => {
          if (response.success) successCount++;
          else failCount++;
          return response;
        })
    );
    
    Promise.all(createPromises)
      .then(() => {
        toast({
          title: "Import completed",
          description: `Successfully imported ${successCount} jobs${failCount > 0 ? `, failed to import ${failCount} jobs` : ''}`,
        });
        if (successCount > 0) refetchJobs();
      })
      .catch(error => {
        toast({
          title: "Error during import",
          description: error.message,
          variant: "destructive",
        });
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
            compact={true}
            isLoading={isProjectLoading}
          />
          
          {selectedProjectId && (
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 space-y-2 md:space-y-0">
              <Input
                className="md:w-[200px]"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Job
              </Button>
            </div>
          )}
        </div>
        
        {selectedProjectId && jobs.length > 0 && (
          <div className="flex justify-end">
            <JobExportImport jobs={jobs} onImport={handleImportJobs} />
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading jobs...</span>
              </div>
            ) : selectedProjectId ? (
              filteredJobs.length > 0 ? (
                <JobsTable 
                  jobs={filteredJobs} 
                  onViewDetails={handleViewJobDetails} 
                  onToggleStatus={(jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    if (isJobActionInProgress[jobId]) {
                      return <Button variant="outline" size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </Button>;
                    }
                    
                    // Determine the action based on current status
                    const action = job.status === "paused" ? "activate" : "pause";
                    const ActionDialog = ({ onConfirm }: { onConfirm: () => void }) => (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant={action === "pause" ? "outline" : "default"} 
                            size="sm"
                          >
                            {action === "pause" ? "Pause" : "Activate"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {action === "pause" ? "Pause Job" : "Activate Job"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {action === "pause" 
                                ? `Are you sure you want to pause "${job.name}"? The job will not run until you activate it again.` 
                                : `Are you sure you want to activate "${job.name}"? The job will start running according to its schedule.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onConfirm}>
                              {action === "pause" ? "Pause Job" : "Activate Job"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                    
                    return (
                      <ActionDialog 
                        onConfirm={() => toggleJobStatus(jobId)} 
                      />
                    );
                  }}
                  onDuplicateJob={(jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    if (isJobActionInProgress[jobId]) {
                      return <Button variant="outline" size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </Button>;
                    }
                    
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Duplicate Job</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to create a copy of "{job.name}"?
                              A new job will be created with the same settings.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDuplicateJob(jobId)}>
                              Duplicate Job
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  }}
                  onDeleteJob={(jobId) => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    if (isJobActionInProgress[jobId]) {
                      return <Button variant="destructive" size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </Button>;
                    }
                    
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{job.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteJob(jobId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Job
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "No jobs found matching your search query" 
                      : "No jobs found for this project"}
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Job
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">Select a project to see its jobs</p>
              </div>
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
