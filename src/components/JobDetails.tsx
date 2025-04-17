
import { CronJob } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { RefetchOptions, QueryObserverResult } from "@tanstack/react-query";

interface JobDetailsProps {
  job: CronJob | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (options?: RefetchOptions) => Promise<QueryObserverResult<CronJob[], Error>>;
  onDelete?: (jobId: string) => void;
  onTrigger?: (jobId: string) => void;
}

export function JobDetails({ job, isOpen, onClose, onUpdate, onDelete, onTrigger }: JobDetailsProps) {
  if (!job) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {job.name}
            <StatusBadge status={job.status} />
          </SheetTitle>
          <SheetDescription>{job.description}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Endpoint Information</CardTitle>
              </CardHeader>
              <CardContent className="pb-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">HTTP Method</h3>
                    <div className="inline-flex px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                      {job.httpMethod}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Endpoint URL</h3>
                    <div className="flex items-center gap-2">
                      <p className="break-all">{job.endpoint}</p>
                      <a 
                        href={job.endpoint} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="sr-only">Open URL</span>
                      </a>
                    </div>
                  </div>

                  {job.requestBody && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Request Body</h3>
                      <div className="bg-muted p-3 rounded overflow-auto max-h-[200px]">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {job.requestBody}
                        </pre>
                      </div>
                    </div>
                  )}

                  {job.tags && job.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between text-xs text-muted-foreground">
                <div>Created: {formatDate(job.createdAt)}</div>
                <div>Updated: {formatDate(job.updatedAt)}</div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule Configuration</CardTitle>
                <CardDescription>
                  When and how this job is scheduled to run
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Schedule Expression</h3>
                  <div className="bg-muted p-2 font-mono text-sm rounded">
                    {job.schedule}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Timezone</h3>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {job.timezone || 'UTC'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Next Run</h3>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(job.nextRun)}
                    </p>
                  </div>
                </div>

                {(job.successCount !== undefined || job.failCount !== undefined) && (
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Success</h3>
                      <p className="text-lg font-medium text-success">{job.successCount || 0}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Failed</h3>
                      <p className="text-lg font-medium text-destructive">{job.failCount || 0}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Avg. Runtime</h3>
                      <p className="text-lg font-medium">
                        {job.averageRuntime || 0}s
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Execution History</CardTitle>
                <CardDescription>
                  Recent job execution logs
                </CardDescription>
              </CardHeader>
              <ScrollArea className="h-[300px]">
                <CardContent>
                  <div className="space-y-4">
                    {/* Placeholder for job logs */}
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-muted-foreground">Log data loading...</p>
                    </div>
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
