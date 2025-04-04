
import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Box, Paper, Grid, InputBase, useTheme, useMediaQuery } from "@mui/material";
import { Search, Plus, ListFilter, CalendarDays, Layout, FileJson } from "lucide-react";
import { useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { CronJob } from "@/lib/types";
import { fetchJobs, toggleJobStatus, deleteJob, duplicateJob } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { JobExportImport } from "@/components/JobExportImport";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const deferredSearch = useDeferredValue(search);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "คัดลอกงานสำเร็จ",
        description: "งานถูกคัดลอกเรียบร้อยแล้ว",
      });
    },
  });

  const handleCreateClick = () => {
    navigate("/jobs/create");
  };

  const handleViewDetails = useCallback((job: CronJob) => {
    navigate(`/jobs/${job.id}`);
  }, [navigate]);

  const handleEditJob = useCallback((job: CronJob) => {
    navigate(`/jobs/${job.id}/edit`);
  }, [navigate]);

  const handleDeleteJob = useCallback((job: CronJob) => {
    deleteMutation.mutate(job.id);
  }, [deleteMutation]);

  const handleDuplicateJob = useCallback((job: CronJob) => {
    duplicateMutation.mutate(job.id);
  }, [duplicateMutation]);

  const handleToggleStatus = useCallback((jobId: string) => {
    toggleStatusMutation.mutate(jobId);
    return null;
  }, [toggleStatusMutation]);

  const handleBulkImport = (importedJobs: CronJob[]) => {
    // This would typically be a different API call to bulk import jobs
    toast({
      title: "นำเข้าสำเร็จ",
      description: `นำเข้างาน ${importedJobs.length} รายการ`,
    });
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  // Filter jobs based on search and filter mode
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                          job.endpoint.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                          job.schedule.toLowerCase().includes(deferredSearch.toLowerCase());

    const matchesFilter = filterMode === "all" ||
                           (filterMode === "active" && job.status === "active") ||
                           (filterMode === "paused" && job.status === "paused") ||
                           (filterMode === "failed" && job.status === "failed");

    return matchesSearch && matchesFilter;
  });

  return (
    <PageLayout title="ตารางการทำงาน CRON">
      <Box display="flex" flexDirection="column" gap={3}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                pl: 2
              }}>
                <Search size={18} color="action" />
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="ค้นหางาน..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
              <Button onClick={handleCreateClick} startIcon={!isMobile && <Plus size={16} />}>
                {isMobile ? <Plus size={16} /> : "สร้างงานใหม่"}
              </Button>
              
              <JobExportImport onImport={handleBulkImport} jobs={jobs} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}>
                <ToggleGroup type="single" value={filterMode} onValueChange={(value) => value && setFilterMode(value)}>
                  <ToggleGroupItem value="all" aria-label="All">
                    <ListFilter size={16} className="mr-2" />
                    ทั้งหมด
                  </ToggleGroupItem>
                  <ToggleGroupItem value="active" aria-label="Active">
                    <CalendarDays size={16} className="mr-2" />
                    กำลังทำงาน
                  </ToggleGroupItem>
                  <ToggleGroupItem value="paused" aria-label="Paused">
                    <Layout size={16} className="mr-2" />
                    หยุดชั่วคราว
                  </ToggleGroupItem>
                  <ToggleGroupItem value="failed" aria-label="Failed">
                    <FileJson size={16} className="mr-2" />
                    ล้มเหลว
                  </ToggleGroupItem>
                </ToggleGroup>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <JobsTable
          jobs={filteredJobs}
          onEdit={handleEditJob}
          onDelete={handleDeleteJob}
          onDuplicate={handleDuplicateJob}
          onViewDetails={handleViewDetails}
          onToggleStatus={handleToggleStatus}
        />
      </Box>
    </PageLayout>
  );
}
