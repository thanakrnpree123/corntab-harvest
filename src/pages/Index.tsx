import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { apiService } from "@/lib/api-service";
import { useTranslation } from 'react-i18next';
import { CronJob, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { JobDashboardDetail } from "@/components/JobDashboardDetail";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Filter, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Server, 
  Calendar, 
  Clock, 
  Activity 
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import dayjs from "dayjs";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { StatsCard } from "@/components/StatsCard";
import { JobListItem } from "@/components/JobListItem";
import { RecentJobsList } from "@/components/RecentJobsList";

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
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
  ).slice(0, 50);  // ให้เพียงพอ เผื่อ scroll

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
            <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('dashboard.filterProjects')}
                className="px-2 py-1 text-sm border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={selectedProjectId || "all"}
              onValueChange={(value) => setSelectedProjectId(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard title={t('dashboard.stats.totalJobs')} value={jobStats.total} />
          <StatsCard title={t('dashboard.stats.active')} value={jobStats.active} />
          <StatsCard title={t('dashboard.stats.paused')} value={jobStats.paused} color="gray" />
          <StatsCard title={t('dashboard.stats.success')} value={jobStats.success} color="green" icon={CheckCircle} />
          <StatsCard title={t('dashboard.stats.failed')} value={jobStats.failed} color="red" icon={AlertTriangle} />
          <StatsCard title={t('idle')} value={jobStats.idle} color="gray" icon={AlertTriangle} />
          
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 h-[420px]">
          <div className="md:col-span-1 h-full flex flex-col">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{t('dashboard.recentJobs.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 h-auto">
                <Tabs defaultValue="recent" className="flex flex-col h-full">
                  <TabsList className="w-full bg-transparent border-b rounded-none">
                    <TabsTrigger value="recent" className="flex-1">{t('common.recent')}</TabsTrigger>
                    <TabsTrigger value="failed" className="flex-1">{t('common.failed')}</TabsTrigger>
                    <TabsTrigger value="paused" className="flex-1">{t('common.paused')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="flex-1 h-full">
                    <RecentJobsList
                      jobs={recentJobs}
                      selectedJobId={selectedJobId}
                      setSelectedJobId={setSelectedJobId}
                      projects={projects}
                      searchMsg={t('dashboard.recentJobs.noJobs')}
                    />
                  </TabsContent>
                  <TabsContent value="failed" className="flex-1 h-full">
                    <RecentJobsList
                      jobs={failedJobs}
                      selectedJobId={selectedJobId}
                      setSelectedJobId={setSelectedJobId}
                      projects={projects}
                      searchMsg={t('dashboard.recentJobs.noFailed')}
                    />
                  </TabsContent>
                  <TabsContent value="paused" className="flex-1 h-full">
                    <RecentJobsList
                      jobs={pausedJobs}
                      selectedJobId={selectedJobId}
                      setSelectedJobId={setSelectedJobId}
                      projects={projects}
                      searchMsg={t('dashboard.recentJobs.noPaused')}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 h-full flex flex-col">
            {selectedJob ? (
              <JobDashboardDetail job={selectedJob} onRefresh={refetchJobs} />
            ) : (
              <Card className="h-full flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  {t('dashboard.selectJob')}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
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
