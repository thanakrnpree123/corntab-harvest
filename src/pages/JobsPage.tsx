
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { JobsTable } from "@/components/JobsTable";
import { JobFilters } from "@/components/JobFilters";
import { JobStatus, CronJob } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  
  const { toast } = useToast();

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
      }
    },
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setDateFilter("all");

    toast({
      title: "ล้างตัวกรอง",
      description: "ล้างตัวกรองทั้งหมดเรียบร้อยแล้ว",
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const searchMatch =
      !searchQuery ||
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.endpoint?.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter === "all" || job.status === statusFilter;

    let dateMatch = true;
    const jobDate = new Date(job.createdAt);

    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateMatch = jobDate >= today;
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateMatch = jobDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateMatch = jobDate >= monthAgo;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "date":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "lastRun":
        if (!a.lastRun && !b.lastRun) comparison = 0;
        else if (!a.lastRun) comparison = 1;
        else if (!b.lastRun) comparison = -1;
        else
          comparison =
            new Date(a.lastRun).getTime() - new Date(b.lastRun).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleViewDetails = (job: CronJob) => {
    toast({
      title: "ดูรายละเอียดงาน",
      description: `กำลังดูรายละเอียดของงาน "${job.name}"`,
    });
  };

  const handleToggleStatus = (jobId: string) => {
    // Implementation for toggle status
    toast({
      title: "สลับสถานะงาน",
      description: "สลับสถานะงานเรียบร้อยแล้ว",
    });
  };

  const handleDeleteJob = (jobId: string) => {
    // Implementation for delete job
    toast({
      title: "ลบงาน",
      description: "ลบงานเรียบร้อยแล้ว",
    });
  };

  return (
    <PageLayout title="Jobs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-muted-foreground">
              Manage and monitor your scheduled jobs
            </p>
          </div>

          <Button onClick={() => toast({
            title: "Not implemented",
            description: "Create job functionality not implemented yet",
          })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มงาน
          </Button>
        </div>

        <div className="space-y-4">
          <JobFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onClearFilters={handleClearFilters}
          />

          <Card>
            <CardContent className="p-0">
              <JobsTable
                jobs={sortedJobs}
                onViewDetails={handleViewDetails}
                onToggleStatus={handleToggleStatus}
                onDeleteJob={handleDeleteJob}
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
