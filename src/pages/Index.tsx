import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { CronJob } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import dayjs from "dayjs";
import { 
  Activity, 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Server 
} from "lucide-react";
import { JobDashboardDetail } from "@/components/JobDashboardDetail";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary
} from "@mui/material";

export default function Index() {
  const { toast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recent");
  
  // Fetch all jobs
  const {
    data: jobs = [],
    isLoading,
    refetch
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
  
  // Set first job as selected when data loads
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  // Group jobs by status
  const recentJobs = [...jobs].sort((a, b) => 
    new Date(b.lastRun || 0).getTime() - new Date(a.lastRun || 0).getTime()
  ).slice(0, 5);
  
  const failedJobs = jobs.filter(job => job.status === "failed");
  const pausedJobs = jobs.filter(job => job.status === "paused");
  
  // Calculate statistics
  const jobStats = {
    total: jobs.length,
    active: jobs.filter(job => job.status !== "paused").length,
    paused: pausedJobs.length,
    failed: failedJobs.length,
    success: jobs.filter(job => job.status === "success").length,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <PageLayout title="Dashboard">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={20/100}>
            <StatsCard title="งานทั้งหมด" value={jobStats.total} />
          </Grid>
          <Grid item xs={12} md={4} lg={20/100}>
            <StatsCard title="กำลังทำงาน" value={jobStats.active} />
          </Grid>
          <Grid item xs={12} md={4} lg={20/100}>
            <StatsCard 
              title="สำเร็จ" 
              value={jobStats.success} 
              color="success.main" 
              icon={CheckCircle} 
            />
          </Grid>
          <Grid item xs={12} md={6} lg={20/100}>
            <StatsCard 
              title="ล้มเหลว" 
              value={jobStats.failed} 
              color="error.main" 
              icon={AlertTriangle} 
            />
          </Grid>
          <Grid item xs={12} md={6} lg={20/100}>
            <StatsCard 
              title="หยุดชั่วคราว" 
              value={jobStats.paused} 
              color="text.secondary" 
            />
          </Grid>
        </Grid>

        {/* Recent jobs */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ height: '100%' }}>
              <CardHeader 
                title="งานล่าสุด"
                subheader="งานที่มีการทำงานล่าสุด"
              />
              <Tabs 
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
                centered
              >
                <Tab label="ล่าสุด" value="recent" />
                <Tab label="ล้มเหลว" value="failed" />
                <Tab label="หยุดชั่วคราว" value="paused" />
              </Tabs>
              
              <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
                <List sx={{ width: '100%', p: 0 }}>
                  {activeTab === "recent" && (
                    recentJobs.length > 0 ? (
                      recentJobs.map((job) => (
                        <JobListItem 
                          key={job.id} 
                          job={job} 
                          isSelected={job.id === selectedJobId}
                          onSelect={() => setSelectedJobId(job.id)} 
                        />
                      ))
                    ) : (
                      <ListItem sx={{ justifyContent: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          ยังไม่มีงานที่เคยรัน
                        </Typography>
                      </ListItem>
                    )
                  )}
                  
                  {activeTab === "failed" && (
                    failedJobs.length > 0 ? (
                      failedJobs.map((job) => (
                        <JobListItem 
                          key={job.id} 
                          job={job} 
                          isSelected={job.id === selectedJobId}
                          onSelect={() => setSelectedJobId(job.id)} 
                        />
                      ))
                    ) : (
                      <ListItem sx={{ justifyContent: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          ไม่มีงานที่ล้มเหลว
                        </Typography>
                      </ListItem>
                    )
                  )}
                  
                  {activeTab === "paused" && (
                    pausedJobs.length > 0 ? (
                      pausedJobs.map((job) => (
                        <JobListItem 
                          key={job.id} 
                          job={job} 
                          isSelected={job.id === selectedJobId}
                          onSelect={() => setSelectedJobId(job.id)} 
                        />
                      ))
                    ) : (
                      <ListItem sx={{ justifyContent: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          ไม่มีงานที่ถูกหยุดชั่วคราว
                        </Typography>
                      </ListItem>
                    )
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {selectedJob ? (
              <JobDashboardDetail job={selectedJob} onRefresh={refetch} />
            ) : (
              <Paper sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 3
              }}>
                <Typography variant="body1" color="text.secondary">
                  เลือกงานจากรายการเพื่อดูรายละเอียด
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
}

// Job list item component
function JobListItem({ job, isSelected, onSelect }: { 
  job: CronJob; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <ListItem 
      button
      selected={isSelected}
      onClick={onSelect}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        ...(isSelected && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" noWrap sx={{ flex: 1, mr: 1 }}>
              {job.name}
            </Typography>
            <StatusBadge status={job.status} />
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Server className="h-3 w-3" />
              <Typography variant="caption">{job.httpMethod}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Calendar className="h-3 w-3" />
              <Typography variant="caption">{job.schedule}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock className="h-3 w-3" />
              <Typography variant="caption">
                {job.lastRun 
                  ? dayjs(job.lastRun).format('DD/MM HH:mm')
                  : "ยังไม่เคยรัน"}
              </Typography>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
}

// Stats card component
function StatsCard({ 
  title,
  value,
  color = "primary.main",
  icon: Icon = Activity
}: {
  title: string;
  value: number;
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{ 
            p: 1, 
            borderRadius: '50%', 
            bgcolor: `${color}15`, 
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon className="h-5 w-5" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Mock functions for UI testing
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
