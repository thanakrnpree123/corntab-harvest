import { useState } from "react";
import { JobLog } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Filter logs based on status and search term
  const filteredLogs = logs.filter((log) => {
    // Filter by status
    if (filterStatus && log.status !== filterStatus) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.output.toLowerCase().includes(searchLower) ||
        (log.error && log.error.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        ไม่พบข้อมูลล็อก
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาในล็อก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full min-w-[150px] max-w-full sm:max-w-72"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="กรองตามสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 max-h-[25vh] overflow-y-auto">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Collapsible
              key={log.id}
              open={expandedLogs[log.id]}
              onOpenChange={() => toggleLogExpansion(log.id)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <StatusBadge status={log.status as any} />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {log.duration && (
                        <Badge variant="outline" className="ml-2">
                          {log.duration.toFixed(2)}s
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {expandedLogs[log.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">เริ่ม</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(log.startTime)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">สิ้นสุด</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(log.endTime)}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium mb-1">ผลลัพธ์</h4>
                        <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-[200px]">
                          {log.output || "ไม่มีข้อมูล"}
                        </pre>
                      </div>
                      {log.error && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-red-600 mb-1">ข้อผิดพลาด</h4>
                          <pre className="text-sm bg-red-50 text-red-700 p-3 rounded overflow-auto max-h-[200px]">
                            {log.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
          </div>
        )}
      </div>
    </div>
  );
}