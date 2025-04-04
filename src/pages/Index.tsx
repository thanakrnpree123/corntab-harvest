
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardHeader, Grid, Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, useMediaQuery, useTheme, Paper } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Tabs, Tab } from '@mui/material';
import { ArrowRight, ArrowUpRight, Bell, Calendar, CheckCircle, Clock, FileSpreadsheet, HardDrive, MoreVertical, Plus, Repeat, Server, UserPlus, XCircle } from 'lucide-react';
import { JobsTable } from '@/components/JobsTable';
import { JobDashboardDetail } from '@/components/JobDashboardDetail';
import { useNavigate } from 'react-router-dom';
import { CronJob } from '@/lib/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetchDashboardData } from '@/lib/api';
import { fetchUserNotifications } from '@/lib/api';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export default function Index() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchUserNotifications,
  });

  // หมวดหมู่ในภาษาไทย
  const categories = ['ทั้งหมด', 'กำลังดำเนินงาน', 'ล้มเหลว', 'สำเร็จ'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedJob(null);
  };

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  const handleViewMore = () => {
    navigate('/jobs');
  };

  const handleViewJob = (job: CronJob) => {
    setSelectedJob(job);
  };

  // กรองข้อมูลตาม tab ที่เลือก
  const filteredJobs = dashboardData?.recentJobs?.filter((job) => {
    if (selectedTab === 0) return true;
    else if (selectedTab === 1) return job.status === 'active';
    else if (selectedTab === 2) return job.status === 'failed';
    else if (selectedTab === 3) return job.status === 'completed';
    return true;
  }) || [];

  if (isLoading) {
    return (
      <PageLayout title="Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Clock size={30} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  งาน CRON ทั้งหมด
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {dashboardData?.stats.totalJobs || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <CheckCircle size={30} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  งานสำเร็จ
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {dashboardData?.stats.completedJobs || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <XCircle size={30} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  งานล้มเหลว
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {dashboardData?.stats.failedJobs || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Bell size={30} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  การแจ้งเตือน
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {dashboardData?.stats.notifications || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="งาน CRON ล่าสุด"
              action={
                <Box>
                  <Button 
                    size="sm" 
                    onClick={handleCreateJob}
                    startIcon={<Plus size={16} />}
                  >
                    {!isMobile && "สร้างงาน"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewMore}
                    sx={{ ml: 1 }}
                  >
                    {isMobile ? <ArrowRight size={16} /> : "ดูทั้งหมด"}
                  </Button>
                </Box>
              }
            />
            <Box>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                {categories.map((category, index) => (
                  <Tab
                    key={index}
                    label={category}
                  />
                ))}
              </Tabs>
              
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                <Box flexGrow={1} width="100%" overflow="auto">
                  {selectedJob ? (
                    <JobDashboardDetail job={selectedJob} onBack={() => setSelectedJob(null)} />
                  ) : (
                    <JobsTable
                      jobs={filteredJobs}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onDuplicate={() => {}}
                      onViewDetails={handleViewJob}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="การแจ้งเตือน"
              action={
                <IconButton size="small">
                  <MoreVertical size={16} />
                </IconButton>
              }
            />
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <List>
                  {notifications.map((notification, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: notification.read ? undefined : 'action.selected',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={notification.message}
                        secondary={dayjs(notification.timestamp).fromNow()}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <ArrowUpRight size={16} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <Typography color="text.secondary">ไม่มีการแจ้งเตือน</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
}
