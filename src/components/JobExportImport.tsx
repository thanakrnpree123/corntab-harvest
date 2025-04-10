
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CronJob } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface JobExportImportProps {
  jobs: CronJob[];
  onImport: (jobs: Partial<CronJob>[]) => void;
  disabled?: boolean; // Add disabled prop
}

export function JobExportImport({ jobs, onImport, disabled = false }: JobExportImportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importType, setImportType] = useState<"json" | "csv">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = (type: "json" | "csv") => {
    // Prepare data for export
    const exportData = jobs.map(job => ({
      name: job.name,
      description: job.description,
      schedule: job.schedule,
      endpoint: job.endpoint,
      httpMethod: job.httpMethod,
      timezone: job.timezone,
      useLocalTime: job.useLocalTime,
      tags: job.tags,
      headers: job.headers,
      body: job.body,
      emailNotifications: job.emailNotifications,
      webhookUrl: job.webhookUrl,
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    if (type === "json") {
      content = JSON.stringify(exportData, null, 2);
      filename = `jobs-export-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = "application/json";
    } else {
      // For CSV, create a header row and then data rows
      const headers = [
        "name",
        "description",
        "schedule",
        "endpoint",
        "httpMethod",
        "timezone",
        "useLocalTime",
        "tags",
        "headers",
        "body",
        "emailNotifications",
        "webhookUrl"
      ].join(",");

      const rows = exportData.map(job => {
        return [
          `"${(job.name || "").replace(/"/g, '""')}"`,
          `"${(job.description || "").replace(/"/g, '""')}"`,
          `"${(job.schedule || "").replace(/"/g, '""')}"`,
          `"${(job.endpoint || "").replace(/"/g, '""')}"`,
          `"${(job.httpMethod || "").replace(/"/g, '""')}"`,
          `"${(job.timezone || "").replace(/"/g, '""')}"`,
          job.useLocalTime,
          `"${(Array.isArray(job.tags) ? job.tags.join(";") : "").replace(/"/g, '""')}"`,
          `"${(typeof job.headers === 'object' ? JSON.stringify(job.headers) : "").replace(/"/g, '""')}"`,
          `"${(job.body || "").replace(/"/g, '""')}"`,
          `"${(job.emailNotifications || "").replace(/"/g, '""')}"`,
          `"${(job.webhookUrl || "").replace(/"/g, '""')}"`,
        ].join(",");
      });

      content = [headers, ...rows].join("\n");
      filename = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = "text/csv";
    }

    // Create a download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "ส่งออกสำเร็จ",
      description: `ส่งออกข้อมูล ${jobs.length} งานเรียบร้อยแล้ว`,
    });
  };

  const handleImport = () => {
    setImportError(null);
    
    try {
      let jobsToImport: Partial<CronJob>[] = [];
      
      if (importType === "json") {
        // Parse JSON input
        if (!jsonInput.trim()) {
          setImportError("กรุณาป้อนข้อมูล JSON");
          return;
        }
        
        const parsedData = JSON.parse(jsonInput);
        
        if (!Array.isArray(parsedData)) {
          setImportError("ข้อมูล JSON ต้องเป็นรูปแบบอาร์เรย์");
          return;
        }
        
        jobsToImport = parsedData;
      } else {
        // Parse CSV input
        if (!csvInput.trim()) {
          setImportError("กรุณาป้อนข้อมูล CSV");
          return;
        }
        
        const lines = csvInput.split("\n");
        if (lines.length < 2) {
          setImportError("ข้อมูล CSV ต้องมีอย่างน้อย 2 แถว (ส่วนหัวและข้อมูล)");
          return;
        }
        
        const headers = lines[0].split(",").map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Handle quoted CSV values properly
          const values: string[] = [];
          let currentValue = "";
          let insideQuotes = false;
          
          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            
            if (char === '"') {
              if (insideQuotes && j + 1 < lines[i].length && lines[i][j + 1] === '"') {
                // Handle escaped quotes
                currentValue += '"';
                j++; // Skip next quote
              } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
              }
            } else if (char === ',' && !insideQuotes) {
              // End of value
              values.push(currentValue);
              currentValue = "";
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          values.push(currentValue);
          
          const job: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              if (header === "useLocalTime") {
                job[header] = values[index].toLowerCase() === "true";
              } else if (header === "tags" && values[index]) {
                job[header] = values[index].split(";").map(tag => tag.trim());
              } else if (header === "headers" && values[index]) {
                try {
                  job[header] = JSON.parse(values[index]);
                } catch (e) {
                  job[header] = {};
                }
              } else {
                job[header] = values[index];
              }
            }
          });
          
          jobsToImport.push(job as Partial<CronJob>);
        }
      }
      
      if (jobsToImport.length === 0) {
        setImportError("ไม่พบข้อมูลที่จะนำเข้า");
        return;
      }
      
      // Validate imported jobs
      for (const job of jobsToImport) {
        if (!job.name) {
          setImportError("ทุกงานต้องมีชื่อ");
          return;
        }
        
        if (!job.schedule) {
          setImportError(`งาน "${job.name}" ไม่มีกำหนดการทำงาน`);
          return;
        }
        
        if (!job.endpoint) {
          setImportError(`งาน "${job.name}" ไม่มี endpoint`);
          return;
        }
      }
      
      onImport(jobsToImport);
      setIsDialogOpen(false);
      setJsonInput("");
      setCsvInput("");
      
      toast({
        title: "นำเข้าสำเร็จ",
        description: `นำเข้า ${jobsToImport.length} งานเรียบร้อยแล้ว`,
      });
    } catch (error) {
      setImportError(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
      
      toast({
        title: "นำเข้าไม่สำเร็จ",
        description: `เกิดข้อผิดพลาด: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("json")}
        disabled={disabled}
      >
        <ArrowDownToLine className="mr-2 h-4 w-4" />
        ส่งออก JSON
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={disabled}
      >
        <ArrowDownToLine className="mr-2 h-4 w-4" />
        ส่งออก CSV
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            นำเข้า
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>นำเข้าข้อมูลงาน</DialogTitle>
            <DialogDescription>
              นำเข้าข้อมูลงานจากไฟล์ JSON หรือ CSV ที่ส่งออกจากระบบนี้
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="json" onValueChange={(v) => setImportType(v as "json" | "csv")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="csv">CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="json">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="json-input">ข้อมูล JSON</Label>
                  <Textarea
                    id="json-input"
                    placeholder='[{"name": "Job Name", "schedule": "* * * * *", ...}]'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={10}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="csv">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-input">ข้อมูล CSV</Label>
                  <Textarea
                    id="csv-input"
                    placeholder="name,schedule,endpoint,..."
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    rows={10}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {importError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleImport}>
              นำเข้า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
