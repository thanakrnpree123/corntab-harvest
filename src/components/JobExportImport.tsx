
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CronJob } from "@/lib/types";
import { Download, Upload, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface JobExportImportProps {
  jobs: CronJob[];
  onImport: (jobs: Partial<CronJob>[]) => void;
}

export function JobExportImport({ jobs, onImport }: JobExportImportProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importType, setImportType] = useState<"json" | "csv">("json");
  const [importError, setImportError] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Export jobs to JSON
  const handleExportJSON = () => {
    // คัดลอกเฉพาะข้อมูลที่จำเป็นสำหรับการ import กลับ
    const exportData = jobs.map(job => ({
      name: job.name,
      schedule: job.schedule,
      endpoint: job.endpoint,
      httpMethod: job.httpMethod,
      requestBody: job.requestBody,
      description: job.description,
      timezone: job.timezone,
      useLocalTime: job.useLocalTime,
      tags: job.tags,
      emailNotifications: job.emailNotifications,
      webhookUrl: job.webhookUrl
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cron-jobs-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "ส่งออกเรียบร้อย",
      description: `ส่งออกข้อมูล Cron Jobs จำนวน ${jobs.length} รายการสำเร็จ`,
    });
  };

  // Export jobs to CSV
  const handleExportCSV = () => {
    // สร้าง header สำหรับ CSV
    const headers = ["name", "schedule", "endpoint", "httpMethod", "requestBody", "description", "timezone", "useLocalTime", "tags"];
    
    // สร้างข้อมูลแต่ละแถว
    const rows = jobs.map(job => [
      `"${job.name.replace(/"/g, '""')}"`,
      job.schedule,
      `"${job.endpoint.replace(/"/g, '""')}"`,
      job.httpMethod,
      job.requestBody ? `"${job.requestBody.replace(/"/g, '""')}"` : "",
      job.description ? `"${job.description.replace(/"/g, '""')}"` : "",
      job.timezone,
      job.useLocalTime.toString(),
      job.tags.length > 0 ? `"${job.tags.join(',').replace(/"/g, '""')}"` : ""
    ]);
    
    // รวมข้อมูลเป็น CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // ดาวน์โหลด CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cron-jobs-export-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "ส่งออกเรียบร้อย",
      description: `ส่งออกข้อมูล Cron Jobs จำนวน ${jobs.length} รายการเป็นไฟล์ CSV สำเร็จ`,
    });
  };

  // Process import data
  const processImportData = async () => {
    setIsProcessing(true);
    setImportError(null);
    
    try {
      let jobsToImport: Partial<CronJob>[] = [];
      
      if (importType === "json") {
        if (!importText && !importFile) {
          throw new Error("กรุณาใส่ข้อมูล JSON หรือเลือกไฟล์");
        }
        
        if (importFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const fileContent = e.target?.result as string;
              jobsToImport = JSON.parse(fileContent);
              validateAndImportJobs(jobsToImport);
            } catch (error) {
              setImportError(`ไม่สามารถอ่านไฟล์ JSON ได้: ${error instanceof Error ? error.message : "รูปแบบไฟล์ไม่ถูกต้อง"}`);
              setIsProcessing(false);
            }
          };
          reader.readAsText(importFile);
          return; // รอให้ FileReader ทำงานเสร็จ
        } else {
          jobsToImport = JSON.parse(importText);
        }
      } else if (importType === "csv") {
        if (!importText && !importFile) {
          throw new Error("กรุณาใส่ข้อมูล CSV หรือเลือกไฟล์");
        }
        
        const content = importFile ? await readFileAsText(importFile) : importText;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        jobsToImport = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const job: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              if (header === 'useLocalTime') {
                job[header] = values[index].toLowerCase() === 'true';
              } else if (header === 'tags' && values[index]) {
                job[header] = values[index].split(',').map((tag: string) => tag.trim());
              } else {
                job[header] = values[index];
              }
            }
          });
          
          return job;
        });
      }
      
      validateAndImportJobs(jobsToImport);
    } catch (error) {
      setImportError(`การนำเข้าล้มเหลว: ${error instanceof Error ? error.message : "รูปแบบข้อมูลไม่ถูกต้อง"}`);
      setIsProcessing(false);
    }
  };
  
  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  // Helper function to parse CSV line (handles quoted values)
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes inside quoted value
          currentValue += '"';
          i++; // skip next quote
        } else {
          // Toggle quote state
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        // End of field
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last field
    result.push(currentValue);
    return result;
  };
  
  // Validate and import jobs
  const validateAndImportJobs = (jobsToImport: Partial<CronJob>[]) => {
    // ตรวจสอบว่าข้อมูลเป็น array และมีข้อมูลที่จำเป็น
    if (!Array.isArray(jobsToImport)) {
      setImportError("ข้อมูลต้องอยู่ในรูปแบบ array");
      setIsProcessing(false);
      return;
    }
    
    // ตรวจสอบว่าแต่ละรายการมีข้อมูลที่จำเป็น
    const validJobs = jobsToImport.filter(job => job.name && job.schedule && job.endpoint);
    
    if (validJobs.length === 0) {
      setImportError("ไม่พบข้อมูลที่ถูกต้อง (ต้องมีชื่องาน, ตารางเวลา และ endpoint เป็นอย่างน้อย)");
      setIsProcessing(false);
      return;
    }
    
    if (validJobs.length !== jobsToImport.length) {
      toast({
        title: "พบข้อมูลบางรายการไม่ถูกต้อง",
        description: `จะนำเข้าเฉพาะ ${validJobs.length} รายการที่มีข้อมูลครบถ้วน จากทั้งหมด ${jobsToImport.length} รายการ`,
        variant: "destructive"
      });
    }
    
    // นำเข้าข้อมูล
    onImport(validJobs);
    setIsImportDialogOpen(false);
    setImportText("");
    setImportFile(null);
    setImportError(null);
    setIsProcessing(false);
    
    toast({
      title: "นำเข้าข้อมูลสำเร็จ",
      description: `นำเข้า Cron Jobs จำนวน ${validJobs.length} รายการเรียบร้อย`
    });
  };

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImportFile(files[0]);
      setImportText("");
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          นำเข้า
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportJSON}>
          <Download className="mr-2 h-4 w-4" />
          ส่งออก
        </Button>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>นำเข้า Cron Jobs</DialogTitle>
            <DialogDescription>
              นำเข้า Cron Jobs จากไฟล์ JSON หรือ CSV หรือวางข้อมูลโดยตรง
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="json" onValueChange={(val) => setImportType(val as "json" | "csv")}>
            <TabsList className="mb-4">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="csv">CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="json">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">อัปโหลดไฟล์ JSON</label>
                  <Input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="- text-center my-2 text-sm text-muted-foreground">หรือ</div>
                <div>
                  <label className="block text-sm font-medium mb-2">วางข้อมูล JSON</label>
                  <textarea
                    className="w-full min-h-[200px] p-2 border rounded-md"
                    placeholder='[{"name":"Job 1","schedule":"0 * * * *","endpoint":"https://example.com/api",...}]'
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportFile(null);
                    }}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="csv">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">อัปโหลดไฟล์ CSV</label>
                  <Input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="- text-center my-2 text-sm text-muted-foreground">หรือ</div>
                <div>
                  <label className="block text-sm font-medium mb-2">วางข้อมูล CSV</label>
                  <textarea
                    className="w-full min-h-[200px] p-2 border rounded-md"
                    placeholder="name,schedule,endpoint,httpMethod,description
job1,0 * * * *,https://example.com/api,GET,Example job"
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportFile(null);
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ข้อผิดพลาด</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={processImportData} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังนำเข้า...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  นำเข้าข้อมูล
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
