
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography, Box, Paper, Card, CardContent, CircularProgress } from "@mui/material";
import Grid from '@mui/material/Grid';  // Import Grid directly from @mui/material/Grid
import { apiService } from "@/lib/api-service";
import MainLayout from "@/components/layout/MainLayout";
import { ChevronRight, Layers, Activity, Timer, Settings } from "lucide-react";
import { format } from "date-fns";

export default function Index() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  
  const features = [
    {
      title: 'Job Scheduling',
      description: 'Schedule jobs with cron expressions or fixed intervals',
      icon: <Timer size={24} />
    },
    {
      title: 'HTTP Webhooks',
      description: 'Make HTTP requests to any endpoint with custom data',
      icon: <Activity size={24} />
    },
    {
      title: 'Project Organization',
      description: 'Organize jobs into projects for better management',
      icon: <Layers size={24} />
    },
    {
      title: 'Advanced Settings',
      description: 'Configure timeouts, retries, and notifications',
      icon: <Settings size={24} />
    }
  ];
  
  const { isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          const jobs = response.data;
          
          setStats({
            totalJobs: jobs.length,
            activeJobs: jobs.filter(job => job.status === 'running').length,
            completedJobs: jobs.filter(job => job.status === 'success').length,
            failedJobs: jobs.filter(job => job.status === 'failed').length
          });
          
          const recent = [...jobs]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
          
          setRecentJobs(recent);
          return jobs;
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return [];
      }
    }
  });

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your scheduled jobs and system status
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item key={index} xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Recent Jobs</Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : recentJobs.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {recentJobs.map((job) => (
                  <Box 
                    key={job.id} 
                    sx={{ 
                      py: 1.5, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body1">{job.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {job.lastRun ? `Last run: ${format(new Date(job.lastRun), 'MMM dd, HH:mm')}` : 'Never run'}
                        </Typography>
                      </Box>
                    </Box>
                    <ChevronRight size={18} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
                <Typography>No recent jobs found</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="h4">{stats.totalJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Jobs</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">{stats.activeJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Jobs</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{stats.completedJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed Jobs</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">{stats.failedJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">Failed Jobs</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
