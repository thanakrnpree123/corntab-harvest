import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { apiService } from "@/lib/api-service";
import { CronJob, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { JobDashboardDetail } from "@/components/JobDashboardDetail";
import { StatusBadge } from "@/components/StatusBadge";
import dayjs from "dayjs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight, CheckCircle, AlertTriangle, Server, Calendar, Clock, Activity } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          return response.data;
        }
        console.warn("Using mock projects due to API error:", response.error);
        return getMockProjects();
      } catch (error) {
        console.warn("Using mock projects due to API error:", error);
        return getMockProjects();
      }
    },
  });
  
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const {
    data: allJobs = [],
    isLoading: isLoadingJobs,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          return response.data;
        }
        console.warn("Using mock jobs due to API error:", response.error);
        return getMockJobs();
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        return getMockJobs();
      }
    },
  });
  
  const jobs = selectedProjectId 
    ? allJobs.filter(job => job.projectId === selectedProjectId)
    : allJobs;
  
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  const recentJobs = [...jobs].sort((a, b) => 
    new Date(b.lastRun || 0).getTime() - new Date(a.lastRun || 0).getTime()
  ).slice(0, 5);
  
  const failedJobs = jobs.filter(job => job.status === "failed");
  const pausedJobs = jobs.filter(job => job.status === "paused");
  
  const jobStats = {
    total: jobs.length,
    active: jobs.filter(job => job.status !== "paused").length,
    paused: pausedJobs.length,
    failed: failedJobs.length,
    success: jobs.filter(job => job.status === "success").length,
  };

  return (
    <PageLayout title="">
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your scheduled jobs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Total Jobs" value={jobStats.total} />
          <StatsCard title="Active" value={jobStats.active} />
          <StatsCard title="Success" value={jobStats.success} color="green" icon={CheckCircle} />
          <StatsCard title="Failed" value={jobStats.failed} color="red" icon={AlertTriangle} />
          <StatsCard title="Paused" value={jobStats.paused} color="gray" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Recent Jobs</CardTitle>
                <Button 
                  variant="link" 
                  className="text-sm"
                  onClick={() => navigate('/logs')}
                >
                  ดูเพิ่มเติม
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="recent">
                  <TabsList className="w-full bg-transparent border-b rounded-none">
                    <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
                    <TabsTrigger value="failed" className="flex-1">Failed</TabsTrigger>
                    <TabsTrigger value="paused" className="flex-1">Paused</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recent" className="max-h-[50vh] overflow-y-auto">
                    <div className="divide-y">
                      {recentJobs.length > 0 ? (
                        recentJobs.map((job) => (
                          <JobListItem 
                            key={job.id} 
                            job={job} 
                            projectName={projects.find(p => p.id === job.projectId)?.name}
                            isSelected={job.id === selectedJobId}
                            onSelect={() => setSelectedJobId(job.id)} 
                          />
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No jobs have run yet
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="failed" className="m-0 h-[300px] overflow-y-auto">
                    <div className="divide-y">
                      {failedJobs.length > 0 ? (
                        failedJobs.map((job) => (
                          <JobListItem 
                            key={job.id} 
                            job={job} 
                            projectName={projects.find(p => p.id === job.projectId)?.name}
                            isSelected={job.id === selectedJobId}
                            onSelect={() => setSelectedJobId(job.id)} 
                          />
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No failed jobs
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="paused" className="m-0 h-[300px] overflow-y-auto">
                    <div className="divide-y">
                      {pausedJobs.length > 0 ? (
                        pausedJobs.map((job) => (
                          <JobListItem 
                            key={job.id} 
                            job={job}
                            projectName={projects.find(p => p.id === job.projectId)?.name}
                            isSelected={job.id === selectedJobId}
                            onSelect={() => setSelectedJobId(job.id)} 
                          />
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No paused jobs
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {selectedJob ? (
              <JobDashboardDetail job={selectedJob} onRefresh={refetchJobs} />
            ) : (
              <Card className="h-full flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  Select a job from the list to view details
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function JobListItem({ job, projectName, isSelected, onSelect }: { 
  job: CronJob; 
  projectName?: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium truncate mr-2">{job.name}</div>
        <StatusBadge status={job.status} />
      </div>
      {projectName && (
        <div className="text-xs text-muted-foreground mb-1">
          Project: {projectName}
        </div>
      )}
      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          <span>{job.httpMethod}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{job.schedule}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {job.lastRun 
              ? dayjs(job.lastRun).format('DD/MM HH:mm')
              : "Never run"}
          </span>
        </div>
      </div>
    </button>
  );
}

function StatsCard({ 
  title,
  value,
  color = "blue",
  icon: Icon = Activity
}: {
  title: string;
  value: number;
  color?: "blue" | "green" | "red" | "gray";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    gray: "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getMockProjects(): Project[] {
  return [
    {
      id: "project-1",
      name: "Marketing Automation",
      description: "Marketing campaign automation tasks",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "project-2",
      name: "Data Sync",
      description: "Database synchronization jobs",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "project-3",
      name: "Reporting",
      description: "Automated reporting tasks",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

function getMockJobs(): CronJob[] {
  return [
    {
      id: "job-1",
      name: "Send Weekly Newsletter",
      schedule: "0 9 * * 1",
      endpoint: "https://api.example.com/send-newsletter",
      httpMethod: "POST",
      description: "Sends weekly newsletter to subscribers every Monday",
      status: "idle",
      useLocalTime: false,
      timezone: "UTC",
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(Date.now() + 518400000).toISOString(),
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      tags: ["marketing", "email"],
      successCount: 12,
      failCount: 1,
      averageRuntime: 45.2,
      projectId: "project-1",
      emailNotifications: "admin@example.com,notify@example.com",
      webhookUrl: "https://hooks.slack.com/services/XXX/YYY/ZZZ"
    },
    {
      id: "job-2",
      name: "Database Backup",
      schedule: "0 0 * * *",
      endpoint: "https://api.example.com/backup",
      httpMethod: "GET",
      description: "Daily database backup at midnight",
      status: "success",
      useLocalTime: true,
      timezone: "Asia/Bangkok",
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 82800000).toISOString(),
      createdAt: new Date(Date.now() - 7776000000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      tags: ["database", "backup"],
      successCount: 89,
      failCount: 3,
      averageRuntime: 134.7,
      projectId: "project-2",
      emailNotifications: null,
      webhookUrl: null
    },
    {
      id: "job-3",
      name: "Process Customer Orders",
      schedule: "*/15 * * * *",
      endpoint: "https://api.example.com/process-orders",
      httpMethod: "POST",
      description: "Process new customer orders every 15 minutes",
      status: "failed",
      useLocalTime: false,
      timezone: "UTC",
      lastRun: new Date(Date.now() - 900000).toISOString(),
      nextRun: new Date(Date.now() + 900000).toISOString(),
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      tags: ["orders", "customers", "processing"],
      successCount: 1240,
      failCount: 17,
      averageRuntime: 28.3,
      projectId: "project-1",
      emailNotifications: "tech-alerts@example.com",
      webhookUrl: "https://api.example.com/webhook/orders"
    },
    {
      id: "job-4",
      name: "Generate Monthly Report",
      schedule: "0 9 1 * *",
      endpoint: "https://api.example.com/generate-report",
      httpMethod: "POST",
      description: "Generate monthly performance report on the 1st day of each month",
      status: "paused",
      useLocalTime: true,
      timezone: "America/New_York",
      lastRun: new Date(Date.now() - 2592000000).toISOString(),
      nextRun: null,
      createdAt: new Date(Date.now() - 5184000000).toISOString(),
      updatedAt: new Date(Date.now() - 1209600000).toISOString(),
      tags: ["reporting", "monthly"],
      successCount: 6,
      failCount: 0,
      averageRuntime: 326.5,
      projectId: "project-3",
      emailNotifications: "management@example.com,reports@example.com",
      webhookUrl: null
    },
    {
      id: "job-5",
      name: "Clean Temporary Files",
      schedule: "0 2 * * *",
      endpoint: "https://api.example.com/clean-temp",
      httpMethod: "GET",
      description: "Clean temporary files every day at 2 AM",
      status: "running",
      useLocalTime: false,
      timezone: "UTC",
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date(Date.now() - 864000000).toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["maintenance", "cleanup"],
      successCount: 29,
      failCount: 1,
      averageRuntime: 45.8,
      projectId: "project-2",
      emailNotifications: null,
      webhookUrl: "https://hooks.slack.com/services/AAA/BBB/CCC"
    }
  ];
}
