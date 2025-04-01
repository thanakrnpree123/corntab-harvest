
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { CronJob, Project } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Index() {
  // Fetch jobs
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast.error("Error loading recent jobs. Please try again.");
        return [];
      }
    }
  });

  // Prepare sample jobs data for demonstration if no jobs are returned from the API
  const recentJobs = jobs.slice(0, 5);
  
  const sampleJobs: CronJob[] = [{
    id: "1",
    name: "Daily Database Backup",
    endpoint: "https://api.example.com/backup",
    httpMethod: "POST",
    schedule: "0 0 * * *",
    description: "Creates a full database backup every day at midnight",
    status: "success",
    projectId: "1",
    useLocalTime: true,
    timezone: "UTC",
    lastRun: "2023-05-15T00:00:00Z",
    nextRun: "2023-05-16T00:00:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-05-15T00:00:01Z"
  }, {
    id: "2",
    name: "Hourly Log Cleanup",
    endpoint: "https://api.example.com/logs/cleanup",
    httpMethod: "GET",
    schedule: "0 * * * *",
    description: "Cleans up old log files every hour",
    status: "idle",
    projectId: "1",
    useLocalTime: true,
    timezone: "UTC",
    lastRun: "2023-05-15T14:00:00Z",
    nextRun: "2023-05-15T15:00:00Z",
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-05-15T14:00:01Z"
  }, {
    id: "3",
    name: "Weekly Analytics Report",
    endpoint: "https://api.example.com/analytics/report",
    httpMethod: "GET",
    schedule: "0 9 * * 1",
    description: "Generates and emails weekly analytics report every Monday at 9 AM",
    status: "failed",
    projectId: "2",
    useLocalTime: true,
    timezone: "Europe/London",
    lastRun: "2023-05-08T09:00:00Z",
    nextRun: "2023-05-15T09:00:00Z",
    createdAt: "2023-01-03T00:00:00Z",
    updatedAt: "2023-05-08T09:00:30Z"
  }, {
    id: "4",
    name: "Customer Email Newsletter",
    endpoint: "https://api.example.com/email/newsletter",
    httpMethod: "POST",
    schedule: "0 10 * * 4",
    description: "Sends weekly newsletter to customers every Thursday at 10 AM",
    status: "paused",
    projectId: "2",
    useLocalTime: true,
    timezone: "America/New_York",
    lastRun: "2023-05-11T10:00:00Z",
    nextRun: null,
    createdAt: "2023-01-04T00:00:00Z",
    updatedAt: "2023-05-11T12:00:00Z"
  }, {
    id: "5",
    name: "Monthly Invoice Generation",
    endpoint: "https://api.example.com/billing/invoices",
    httpMethod: "POST",
    schedule: "0 0 1 * *",
    description: "Generates monthly invoices on the 1st of each month",
    status: "running",
    projectId: "3",
    useLocalTime: false,
    timezone: "UTC",
    lastRun: "2023-05-01T00:00:00Z",
    nextRun: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-05T00:00:00Z",
    updatedAt: "2023-05-15T16:30:00Z"
  }];

  // Use sample data if no real jobs exist
  const displayJobs = recentJobs.length > 0 ? recentJobs : sampleJobs;

  // Add job-related functions for the display jobs
  const handleToggleStatus = (jobId: string) => {
    // Get the job to show proper confirm message
    const job = displayJobs.find(j => j.id === jobId);
    if (!job) return;

    // Determine the action based on current status
    const newStatus = job.status === "paused" ? "idle" : "paused";
    
    apiService.updateJob(jobId, { status: newStatus })
      .then(response => {
        if (response.success) {
          toast.success(`Job ${newStatus === "paused" ? "paused" : "activated"} successfully`);
        } else {
          toast.error(`Failed to update job status: ${response.error}`);
        }
      })
      .catch(error => {
        toast.error(`Error updating job status: ${error.message}`);
      });
  };

  const handleDeleteJob = (jobId: string) => {
    apiService.deleteJob(jobId)
      .then(response => {
        if (response.success) {
          toast.success("Job deleted successfully");
        } else {
          toast.error(`Failed to delete job: ${response.error}`);
        }
      })
      .catch(error => {
        toast.error(`Error deleting job: ${error.message}`);
      });
  };
  
  return (
    <PageLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-0">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center p-8">
                <span className="text-muted-foreground">Loading jobs...</span>
              </div>
            ) : displayJobs.length > 0 ? (
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Recent Jobs</h3>
                <JobsTable 
                  jobs={displayJobs}
                  onViewDetails={(job) => {
                    // View job details would typically navigate to job details page
                    toast.info(`Viewing details for job: ${job.name}`);
                  }}
                  onToggleStatus={(jobId) => {
                    const job = displayJobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    // Determine the action based on current status
                    const action = job.status === "paused" ? "activate" : "pause";
                    
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className={`px-3 py-1 text-xs font-medium rounded ${
                            action === "pause" ? "bg-gray-200 text-gray-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {action === "pause" ? "Pause" : "Activate"}
                          </button>
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
                            <AlertDialogAction onClick={() => handleToggleStatus(jobId)}>
                              {action === "pause" ? "Pause Job" : "Activate Job"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  }}
                  onDeleteJob={(jobId) => {
                    const job = displayJobs.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Delete
                          </button>
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-4">No recent jobs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
