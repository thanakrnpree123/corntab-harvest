
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CronJob, JobLog } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Clock, AlertTriangle, CheckCircle2, RotateCcw, Settings } from "lucide-react";

interface JobDetailsProps {
  job: CronJob | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetails({ job, isOpen, onClose }: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock logs data
  const mockLogs: JobLog[] = job ? [
    {
      id: "1",
      jobId: job.id,
      status: "success",
      startTime: "2023-04-01T00:00:00Z",
      endTime: "2023-04-01T00:00:05Z",
      duration: 5,
      output: "Job completed successfully.",
      error: null,
    },
    {
      id: "2",
      jobId: job.id,
      status: "failed",
      startTime: "2023-03-31T00:00:00Z",
      endTime: "2023-03-31T00:00:02Z",
      duration: 2,
      output: "",
      error: "Error: Connection timeout",
    }
  ] : [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  if (!job) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <SheetHeader className="pb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl">{job.name}</SheetTitle>
            <StatusBadge status={job.status} pulsing={job.status === "running"} className="ml-2" />
          </div>
          <SheetDescription>
            {job.description || "No description provided."}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex gap-2 my-4">
          {job.status !== "running" ? (
            <Button size="sm" className="flex items-center gap-1">
              <Play className="h-4 w-4" /> Run Now
            </Button>
          ) : (
            <Button size="sm" variant="destructive" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" /> Stop
            </Button>
          )}
          
          {job.status !== "paused" ? (
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Pause className="h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Play className="h-4 w-4" /> Resume
            </Button>
          )}
          
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> Edit
          </Button>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Run History</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 mr-2" /> Schedule
                </div>
                <code className="text-sm">{job.schedule}</code>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 mr-2" /> Timing
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Last Run:</div>
                    <div>{formatDate(job.lastRun)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Next Run:</div>
                    <div>{formatDate(job.nextRun)}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center text-muted-foreground mb-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Success Rate
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Success:</div>
                    <div>{job.successCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Failed:</div>
                    <div>{job.failCount || 0}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 mr-2" /> Average Runtime
                </div>
                <div className="text-sm">
                  {job.averageRuntime ? `${job.averageRuntime}s` : "No data available"}
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <div className="flex items-center text-muted-foreground mb-2">
                Command
              </div>
              <pre className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap overflow-x-auto">
                {job.command}
              </pre>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Recent Executions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLogs.length > 0 ? mockLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell>{formatDate(log.startTime)}</TableCell>
                      <TableCell>{log.duration ? `${log.duration}s` : "—"}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No execution history available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Output/Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLogs.length > 0 ? mockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                    <TableCell>{formatDate(log.startTime)}</TableCell>
                    <TableCell>{log.duration ? `${log.duration}s` : "—"}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.error ? (
                        <div className="flex items-center text-error">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {log.error}
                        </div>
                      ) : log.output}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No execution history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="configuration" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Command</h3>
                <pre className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap overflow-x-auto">
                  {job.command}
                </pre>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Schedule</h3>
                <code className="bg-muted p-2 rounded-md text-sm">{job.schedule}</code>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Created</h3>
                <div>{formatDate(job.createdAt)}</div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                <div>{formatDate(job.updatedAt)}</div>
              </div>
              
              {job.tags && job.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <div key={index} className="bg-muted px-2 py-1 rounded-md text-xs">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
