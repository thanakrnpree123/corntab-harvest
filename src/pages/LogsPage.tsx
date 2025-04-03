
import { LogList } from "@/components/LogList";
import MainLayout from "@/components/layout/MainLayout";

// Sample log data
const sampleLogs: any[] = [
  {
    id: "1",
    jobId: "job-1",
    startTime: "2023-10-15T10:00:00Z",
    endTime: "2023-10-15T10:01:30Z",
    duration: 90,
    status: "success",
    output: "Task completed successfully. All database backups were created.",
    error: null
  },
  {
    id: "2",
    jobId: "job-2",
    startTime: "2023-10-15T09:30:00Z",
    endTime: "2023-10-15T09:30:45Z",
    duration: 45,
    status: "failed",
    output: "Process started but encountered errors.",
    error: "Error: Connection refused to database server."
  },
  {
    id: "3",
    jobId: "job-3",
    startTime: "2023-10-15T09:00:00Z",
    endTime: "2023-10-15T09:05:20Z",
    duration: 320,
    status: "success",
    output: "Email newsletter sent to 1,245 recipients.",
    error: null
  },
  {
    id: "4",
    jobId: "job-1",
    startTime: "2023-10-14T10:00:00Z",
    endTime: "2023-10-14T10:01:15Z",
    duration: 75,
    status: "success",
    output: "Task completed successfully. All database backups were created.",
    error: null
  },
  {
    id: "5",
    jobId: "job-4",
    startTime: null,
    endTime: null,
    status: "running",
    output: "Process running...",
    error: null
  }
];

export default function LogsPage() {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Logs
        </h1>
        <p className="text-gray-500">
          View and monitor all job execution logs
        </p>
      </div>
      
      <LogList logs={sampleLogs} />
    </MainLayout>
  );
}
