
import { useState } from "react";
import { JobLog } from "@/lib/types";
import { 
  Search as SearchIcon, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle, 
  XCircle,
  Play,
  Pause,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface LogListProps {
  logs: JobLog[];
  isLoading?: boolean;
}

export function LogList({ logs, isLoading = false }: LogListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const filteredLogs = logs.filter((log) => {
    if (filterStatus && log.status !== filterStatus) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.output.toLowerCase().includes(searchLower) ||
        (log.error && log.error.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "running":
        return <Play className="w-4 h-4" />;
      case "paused":
        return <Pause className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading...</p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        <p>ไม่พบข้อมูลล็อก</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-500" />
          </div>
          <input
            placeholder="ค้นหาในล็อก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full sm:w-48"
        >
          <option value="">ทั้งหมด</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
        </select>
      </div>

      <div className="max-h-[35vh] overflow-auto">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="mb-4 border rounded-lg shadow-sm overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleLogExpansion(log.id)}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                    {getStatusIcon(log.status)}
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(log.startTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {log.duration && (
                    <span className="text-xs border rounded-full px-2 py-0.5">
                      {`${log.duration.toFixed(2)}s`}
                    </span>
                  )}
                  <button className="p-1">
                    {expandedLogs[log.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {expandedLogs[log.id] && (
                <div className="p-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">เริ่ม</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(log.startTime)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">สิ้นสุด</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(log.endTime)}
                      </p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="font-semibold text-sm mb-1">ผลลัพธ์</h4>
                      <pre className="p-3 bg-gray-100 rounded-md max-h-48 overflow-auto text-sm font-mono">
                        {log.output || "ไม่มีข้อมูล"}
                      </pre>
                    </div>
                    {log.error && (
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="font-semibold text-sm text-red-600 mb-1">ข้อผิดพลาด</h4>
                        <pre className="p-3 bg-red-100 text-red-800 rounded-md max-h-48 overflow-auto text-sm font-mono">
                          {log.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            <p>ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
