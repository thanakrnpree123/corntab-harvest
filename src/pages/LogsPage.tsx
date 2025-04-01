
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { ProjectSelector } from "@/components/ProjectSelector";
import { azureInsightsService } from "@/lib/azure-insights";
import { apiService } from "@/lib/api-service";
import { Project, JobLog, CronJob } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Clock, AlertTriangle, Download } from "lucide-react";

export default function LogsPage() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [timespan, setTimespan] = useState<string>("P1D"); // 1 day
  const [logSource, setLogSource] = useState<"db" | "azure">("db");
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState<string>("");

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
        toast.error("Error fetching projects");
        return [];
      }
    }
  });

  // Fetch jobs based on selected project
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];

      try {
        const response = await apiService.getJobsByProject(selectedProjectId);
        if (response.success && response.data) {
          // Auto-select first job if none is selected
          if (response.data.length > 0 && !selectedJobId) {
            setSelectedJobId(response.data[0].id);
          }
          return response.data;
        }
        return [];
      } catch (error) {
        toast.error("Error fetching jobs");
        return [];
      }
    },
    enabled: !!selectedProjectId
  });

  // Fetch logs based on selected job
  const { 
    data: dbLogs = [], 
    isLoading: isLoadingDbLogs,
    refetch: refetchDbLogs
  } = useQuery({
    queryKey: ['logs', selectedJobId, logSource],
    queryFn: async () => {
      if (!selectedJobId || logSource !== "db") return [];

      try {
        const response = await apiService.getJobLogs(selectedJobId);
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast.error("Error fetching logs from database");
        return [];
      }
    },
    enabled: !!selectedJobId && logSource === "db"
  });

  // Check if Azure Insights is configured
  const isAzureConfigured = azureInsightsService.hasConfig();

  // Function to query Azure logs
  const fetchAzureLogs = async () => {
    if (!isAzureConfigured) {
      toast.warning("Azure Application Insights is not configured");
      return;
    }
    
    if (!selectedJobId) {
      toast.warning("Please select a job to view its logs");
      return;
    }

    setIsQueryLoading(true);
    try {
      const logs = await azureInsightsService.getJobLogs(selectedJobId, timespan);
      setQueryResults(logs);
    } catch (error) {
      toast.error("Error fetching logs from Azure Application Insights");
      setQueryResults([]);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // Run custom query on Azure
  const runCustomQuery = async () => {
    if (!isAzureConfigured) {
      toast.warning("Azure Application Insights is not configured");
      return;
    }
    
    if (!customQuery) {
      toast.warning("Please enter a query");
      return;
    }

    setIsQueryLoading(true);
    try {
      const result = await azureInsightsService.queryLogs({ 
        query: customQuery, 
        timespan 
      });
      setQueryResults(result);
    } catch (error) {
      toast.error("Error running custom query");
      setQueryResults([]);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Fetch Azure logs when selected job changes or timespan changes
  useEffect(() => {
    if (logSource === "azure" && selectedJobId && isAzureConfigured) {
      fetchAzureLogs();
    }
  }, [selectedJobId, timespan, logSource]);

  // Export logs to CSV
  const exportToCSV = () => {
    const logs = logSource === "db" ? dbLogs : queryResults;
    if (!logs.length) {
      toast.warning("No logs to export");
      return;
    }

    let csvContent = "";
    
    // Get headers from the first log entry
    const headers = Object.keys(logs[0]);
    csvContent += headers.join(",") + "\n";
    
    // Add data rows
    logs.forEach(log => {
      const row = headers.map(header => {
        const value = log[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += row.join(",") + "\n";
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageLayout title="Logs">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Project</label>
            <ProjectSelector
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              compact
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Job</label>
            <Select
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              disabled={jobs.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select job" />
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
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Log Source</label>
            <Tabs value={logSource} onValueChange={(value) => setLogSource(value as "db" | "azure")}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="db">Database</TabsTrigger>
                <TabsTrigger value="azure" disabled={!isAzureConfigured}>
                  Azure Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {logSource === "azure" && (
          <Card className="bg-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Azure Application Insights</CardTitle>
              <CardDescription>
                Query logs directly from Azure Application Insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Timespan</label>
                    <Select value={timespan} onValueChange={setTimespan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PT1H">Last hour</SelectItem>
                        <SelectItem value="PT6H">Last 6 hours</SelectItem>
                        <SelectItem value="P1D">Last 24 hours</SelectItem>
                        <SelectItem value="P7D">Last 7 days</SelectItem>
                        <SelectItem value="P30D">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={fetchAzureLogs}
                      disabled={isQueryLoading || !selectedJobId}
                      className="mb-0"
                    >
                      {isQueryLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Refresh Logs
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <label className="text-sm font-medium mb-1 block">Custom Query</label>
                  <div className="flex space-x-2">
                    <Input
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      placeholder="Enter custom Kusto query..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={runCustomQuery}
                      disabled={isQueryLoading || !customQuery}
                    >
                      Run Query
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: traces | where customDimensions.jobId == "{selectedJobId}" | order by timestamp desc
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-lg">Log Entries</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={(logSource === "db" ? dbLogs : queryResults).length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {/* Loading state */}
            {((logSource === "db" && isLoadingDbLogs) || (logSource === "azure" && isQueryLoading)) && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading logs...</span>
              </div>
            )}
            
            {/* Database logs display */}
            {logSource === "db" && !isLoadingDbLogs && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="w-[300px]">Output</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dbLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dbLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <StatusBadge status={log.status} />
                          </TableCell>
                          <TableCell>{formatDate(log.startTime)}</TableCell>
                          <TableCell>{log.endTime ? formatDate(log.endTime) : '—'}</TableCell>
                          <TableCell>
                            {log.duration ? `${log.duration.toFixed(2)}s` : '—'}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {log.output}
                          </TableCell>
                          <TableCell>
                            {log.error ? (
                              <div className="flex items-center text-destructive">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="truncate max-w-[100px]">{log.error}</span>
                              </div>
                            ) : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Azure Insights logs display */}
            {logSource === "azure" && !isQueryLoading && (
              <div>
                {!isAzureConfigured ? (
                  <div className="text-center p-6">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                    <h3 className="mb-2 font-medium">Azure Application Insights is not configured</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Go to Settings page to configure your Azure Application Insights connection.
                    </p>
                    <Button asChild>
                      <a href="/settings">Configure Now</a>
                    </Button>
                  </div>
                ) : queryResults.length === 0 ? (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">No logs found. Try adjusting your query or timespan.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead className="w-[400px]">Message</TableHead>
                          <TableHead>Operation</TableHead>
                          <TableHead>Job</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResults.map((log, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{formatDate(log.timestamp)}</TableCell>
                            <TableCell>{log.severityLevel || log.severity || 'Info'}</TableCell>
                            <TableCell className="max-w-[400px] truncate">{log.message}</TableCell>
                            <TableCell>{log.operation || log.operationName || '—'}</TableCell>
                            <TableCell>{(log.customDimensions && log.customDimensions.jobName) || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
