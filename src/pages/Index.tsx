
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { JobsTable } from "@/components/JobsTable";
import { CreateJobModal } from "@/components/CreateJobModal";
import { JobDetails } from "@/components/JobDetails";
import { CronJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Pause, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

// Mock data for initial display
const mockJobs: CronJob[] = [
  {
    id: "1",
    name: "Database Backup",
    command: "pg_dump -U postgres database > /backups/db_$(date +%Y%m%d).sql",
    schedule: "0 0 * * *",
    status: "success",
    lastRun: "2023-04-01T00:00:00Z",
    nextRun: "2023-04-02T00:00:00Z",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z",
    description: "Daily backup of the main PostgreSQL database",
    tags: ["database", "backup"],
    successCount: 86,
    failCount: 2,
    averageRuntime: 45
  },
  {
    id: "2",
    name: "Log Rotation",
    command: "find /var/log -name \"*.log\" -mtime +7 -exec gzip {} \\;",
    schedule: "0 1 * * *",
    status: "idle",
    lastRun: "2023-04-01T01:00:00Z",
    nextRun: "2023-04-02T01:00:00Z",
    createdAt: "2023-01-20T14:45:00Z",
    updatedAt: "2023-01-20T14:45:00Z",
    description: "Weekly log rotation to compress older log files",
    tags: ["logs", "maintenance"],
    successCount: 12,
    failCount: 0,
    averageRuntime: 15
  },
  {
    id: "3",
    name: "Data Processing",
    command: "python3 /scripts/process_data.py --all",
    schedule: "*/30 * * * *",
    status: "running",
    lastRun: "2023-04-01T12:30:00Z",
    nextRun: "2023-04-01T13:00:00Z",
    createdAt: "2023-02-05T09:15:00Z",
    updatedAt: "2023-02-05T09:15:00Z",
    description: "Process new data files every 30 minutes",
    tags: ["processing", "python"],
    successCount: 48,
    failCount: 3,
    averageRuntime: 120
  },
  {
    id: "4",
    name: "System Updates",
    command: "apt-get update && apt-get upgrade -y",
    schedule: "0 3 * * 0",
    status: "paused",
    lastRun: "2023-03-26T03:00:00Z",
    nextRun: null,
    createdAt: "2023-02-10T11:20:00Z",
    updatedAt: "2023-03-27T08:45:00Z",
    description: "Weekly system updates every Sunday at 3am",
    tags: ["system", "maintenance"],
    successCount: 8,
    failCount: 1,
    averageRuntime: 300
  },
  {
    id: "5",
    name: "Website Monitoring",
    command: "curl -s https://example.com | grep -q 'Welcome' || mail -s 'Website Down' admin@example.com",
    schedule: "*/5 * * * *",
    status: "failed",
    lastRun: "2023-04-01T12:55:00Z",
    nextRun: "2023-04-01T13:00:00Z",
    createdAt: "2023-03-01T16:30:00Z",
    updatedAt: "2023-03-01T16:30:00Z",
    description: "Check website availability every 5 minutes",
    tags: ["monitoring", "website"],
    successCount: 287,
    failCount: 3,
    averageRuntime: 2
  }
];

const Index = () => {
  const [jobs, setJobs] = useState<CronJob[]>(mockJobs);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleCreateJob = (jobData: any) => {
    const newJob: CronJob = {
      id: String(jobs.length + 1),
      name: jobData.name,
      command: jobData.command,
      schedule: jobData.schedule,
      status: "idle",
      lastRun: null,
      nextRun: null, // In a real app, calculate based on schedule
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: jobData.description,
      tags: [],
      successCount: 0,
      failCount: 0,
      averageRuntime: 0
    };

    setJobs([...jobs, newJob]);
  };

  const handleViewJobDetails = (job: CronJob) => {
    setSelectedJob(job);
    setIsDetailSheetOpen(true);
  };

  const countJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status).length;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Add New Job
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{jobs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{countJobsByStatus("running") + countJobsByStatus("idle")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paused</CardTitle>
                <Pause className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{countJobsByStatus("paused")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-error" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{countJobsByStatus("failed")}</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Last Refresh:</span>
                <span>{new Date().toLocaleTimeString()}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-4">
              <JobsTable jobs={jobs} onViewDetails={handleViewJobDetails} />
            </TabsContent>
            
            <TabsContent value="active" className="mt-4">
              <JobsTable 
                jobs={jobs.filter(job => job.status === "running" || job.status === "idle")} 
                onViewDetails={handleViewJobDetails} 
              />
            </TabsContent>
            
            <TabsContent value="paused" className="mt-4">
              <JobsTable 
                jobs={jobs.filter(job => job.status === "paused")} 
                onViewDetails={handleViewJobDetails} 
              />
            </TabsContent>
            
            <TabsContent value="failed" className="mt-4">
              <JobsTable 
                jobs={jobs.filter(job => job.status === "failed")} 
                onViewDetails={handleViewJobDetails} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <CreateJobModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreateJob={handleCreateJob} 
        />
        
        <JobDetails 
          job={selectedJob} 
          isOpen={isDetailSheetOpen} 
          onClose={() => setIsDetailSheetOpen(false)} 
        />
      </main>
    </div>
  );
};

export default Index;
