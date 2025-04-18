
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { apiService } from "@/lib/api-service";
import { ProjectSelector } from "@/components/ProjectSelector";
import { JobsTable } from "@/components/JobsTable";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CreateJobModal } from "@/components/CreateJobModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CronJob } from "@/lib/types";

export default function JobsPage() {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลโปรเจกต์ได้",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", selectedProjectId],
    queryFn: async () => {
      try {
        if (selectedProjectId === "all") {
          const response = await apiService.getJobs(); // Changed from getAllJobs to getJobs
          if (response.success && response.data) {
            return response.data;
          }
        } else {
          const response = await apiService.getJobsByProject(selectedProjectId);
          if (response.success && response.data) {
            return response.data;
          }
        }
        return [];
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลงานได้",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const filteredJobs = jobs.filter(job => {
    const projectMatch = selectedProjectId === "all" || job.projectId === selectedProjectId;
    const searchMatch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    
    let dateMatch = true;
    if (dateFilter !== "all") {
      const jobDate = new Date(job.createdAt);
      const now = new Date();
      
      switch(dateFilter) {
        case "today":
          dateMatch = jobDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateMatch = jobDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateMatch = jobDate >= monthAgo;
          break;
      }
    }

    return projectMatch && searchMatch && statusMatch && dateMatch;
  });

  const activeFilters = [
    selectedProjectId !== "all" && "โปรเจกต์",
    statusFilter !== "all" && "สถานะ",
    dateFilter !== "all" && "วันที่",
  ].filter(Boolean);

  const handleViewDetails = (job: CronJob) => {
    toast({
      title: "ดูรายละเอียดงาน",
      description: `กำลังดูรายละเอียดของงาน "${job.name}"`,
    });
  };

  const handleToggleStatus = (jobId: string) => {
    return <Button>Toggle</Button>;
  };

  const handleDeleteJob = (jobId: string) => {
    return <Button>Delete</Button>;
  };

  const handleDuplicateJob = (jobId: string) => {
    return <Button>Duplicate</Button>;
  };

  const handleCreateJob = (jobData: Partial<CronJob>) => {
    console.log("Creating job", jobData);
    toast({
      title: "สร้างงาน",
      description: `กำลังสร้างงาน "${jobData.name}"`,
    });
  };

  return (
    <PageLayout title="Jobs">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <Input
              placeholder="ค้นหางาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกโปรเจกต์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกโปรเจกต์</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  ตัวกรอง
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">สถานะ</h4>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="idle">ว่าง</SelectItem>
                        <SelectItem value="running">กำลังทำงาน</SelectItem>
                        <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                        <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                        <SelectItem value="failed">ล้มเหลว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">วันที่สร้าง</h4>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกช่วงเวลา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="today">วันนี้</SelectItem>
                        <SelectItem value="week">7 วันที่ผ่านมา</SelectItem>
                        <SelectItem value="month">30 วันที่ผ่านมา</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มงาน
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <JobsTable 
              jobs={filteredJobs}
              onViewDetails={handleViewDetails}
              onToggleStatus={handleToggleStatus}
              onDeleteJob={handleDeleteJob}
              onDuplicateJob={handleDuplicateJob}
            />
          </CardContent>
        </Card>
      </div>

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateJob={handleCreateJob}
        projects={projects}
        selectedProjectId={selectedProjectId === "all" ? undefined : selectedProjectId}
      />
    </PageLayout>
  );
}
