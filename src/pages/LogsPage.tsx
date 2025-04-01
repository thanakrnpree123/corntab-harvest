
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface LogsFilter {
  status: string;
  dateRange: [Date | null, Date | null] | null;
  search: string;
}

export default function LogsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [logsFilter, setLogsFilter] = useState<LogsFilter>({
    status: "",
    dateRange: null,
    search: ""
  });
  const { toast } = useToast();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          if (response.data.length > 0 && !selectedProjectId) {
            setSelectedProjectId(response.data[0].id);
          }
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching projects",
          description: "There was an error loading your projects. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Fetch jobs for selected project
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      try {
        const response = await apiService.getJobsByProject(selectedProjectId);
        if (response.success && response.data) {
          // Set first job as selected if none is selected yet
          if (response.data.length > 0 && !selectedJobId) {
            setSelectedJobId(response.data[0].id);
          }
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching jobs",
          description: "There was an error loading the jobs. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedProjectId
  });

  // Fetch logs for selected job
  const { 
    data: logs = [],
    isLoading: isLoadingLogs,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['logs', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return [];
      
      try {
        const response = await apiService.getJobLogs(selectedJobId);
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching logs",
          description: "There was an error loading the logs. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedJobId
  });

  // Filter logs based on criteria
  const filteredLogs = useMemo(() => {
    if (!logs.length) return [];
    
    return logs.filter(log => {
      // Status filter
      if (logsFilter.status && log.status !== logsFilter.status) {
        return false;
      }
      
      // Date range filter
      if (logsFilter.dateRange && logsFilter.dateRange[0] && logsFilter.dateRange[1]) {
        const startDate = new Date(logsFilter.dateRange[0]);
        const endDate = new Date(logsFilter.dateRange[1]);
        const logDate = new Date(log.startTime);
        
        if (logDate < startDate || logDate > endDate) {
          return false;
        }
      }
      
      // Search filter
      if (logsFilter.search) {
        const searchLower = logsFilter.search.toLowerCase();
        return (
          log.output.toLowerCase().includes(searchLower) ||
          (log.error && log.error.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [logs, logsFilter]);

  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    apiService.createProject(projectData)
      .then(response => {
        if (response.success && response.data) {
          setSelectedProjectId(response.data.id);
          toast({
            title: "Project Created",
            description: `Project "${projectData.name}" was created successfully`,
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to create project: ${response.error}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Error creating project: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  return (
    <PageLayout title="Logs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateProject={handleCreateProject}
            compact={true}
          />
          
          {/* Job selector */}
          <Select value={selectedJobId} onValueChange={setSelectedJobId} disabled={!jobs.length}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Log filtering options */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Status Filter */}
          <Select onValueChange={(value) => setLogsFilter(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !logsFilter.dateRange ? "text-muted-foreground" : undefined
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {logsFilter.dateRange && logsFilter.dateRange[0] && logsFilter.dateRange[1] ? (
                  logsFilter.dateRange[0]?.toLocaleDateString() === logsFilter.dateRange[1]?.toLocaleDateString() ? (
                    format(logsFilter.dateRange[0], "PPP")
                  ) : (
                    `${format(logsFilter.dateRange[0], "PPP")} - ${format(logsFilter.dateRange[1], "PPP")}`
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="range"
                defaultMonth={logsFilter.dateRange && logsFilter.dateRange[0] ? logsFilter.dateRange[0] : new Date()}
                selected={{
                  from: logsFilter.dateRange ? logsFilter.dateRange[0] : undefined,
                  to: logsFilter.dateRange ? logsFilter.dateRange[1] : undefined
                }}
                onSelect={(date) => setLogsFilter(prev => ({ 
                  ...prev, 
                  dateRange: date ? [date.from, date.to] as [Date, Date] : null 
                }))}
                numberOfMonths={2}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>

          {/* Search Filter */}
          <Input
            type="search"
            placeholder="Search logs..."
            className="w-full md:w-[200px]"
            value={logsFilter.search}
            onChange={(e) => setLogsFilter(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        {/* Log display */}
        <Card>
          <CardContent className="p-4">
            {isLoadingLogs ? (
              <div className="flex items-center justify-center p-8">
                <span className="text-muted-foreground">Loading logs...</span>
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration (seconds)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Output
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.startTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.endTime || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.duration || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <pre>{log.output}</pre>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.error ? <pre>{log.error}</pre> : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <span className="text-muted-foreground">No logs found for the selected job and filters.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
