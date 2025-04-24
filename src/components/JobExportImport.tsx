
import { useState, useRef } from "react";
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
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileJson,
  FileText,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { validateFileContent } from "@/utils/fileValidation";

export interface JobExportImportProps {
  jobs: CronJob[];
  onImport: (jobs: Partial<CronJob>[]) => void;
  onExport: (format: "json" | "csv") => void;
  disabled?: boolean;
}

export function JobExportImport({
  jobs,
  onImport,
  onExport,
  disabled = false,
}: JobExportImportProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<"json" | "csv">("json");
  const [inputMethod, setInputMethod] = useState<"manual" | "upload">("manual");
  const [jsonInput, setJsonInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = (format: "json" | "csv") => {
    onExport(format);
    setIsExportDialogOpen(false);
  };

  const handleImport = () => {
    setImportError(null);
    
    try {
      let content = "";
      
      if (inputMethod === "manual") {
        content = importType === "json" ? jsonInput : csvInput;
      } else if (inputMethod === "upload" && uploadedFile) {
        const reader = new FileReader();
        reader.readAsText(uploadedFile);
        reader.onload = (e) => {
          const fileContent = e.target?.result as string;
          validateAndProcessContent(fileContent);
        };
        return;
      } else {
        setImportError(inputMethod === "upload" ? "กรุณาเลือกไฟล์ที่จะนำเข้า" : "กรุณาป้อนข้อมูล");
        return;
      }
      
      validateAndProcessContent(content);
      
    } catch (error) {
      setImportError(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
    }
  };

  const validateAndProcessContent = (content: string) => {
    const validation = validateFileContent(content, importType);
    
    if (!validation.isValid) {
      setImportError(validation.error || "รูปแบบไฟล์ไม่ถูกต้อง");
      return;
    }

    try {
      let jobsToImport: Partial<CronJob>[] = [];

      if (importType === "json") {
        // Parse JSON input
        const parsedData = JSON.parse(content);

        if (!Array.isArray(parsedData)) {
          setImportError("ข้อมูล JSON ต้องเป็นรูปแบบอาร์เรย์");
          return;
        }

        jobsToImport = parsedData;
      } else {
        // Parse CSV input
        const lines = content.split("\n");
        if (lines.length < 2) {
          setImportError("ข้อมูล CSV ต้องมีอย่างน้อย 2 แถว (ส่วนหัวและข้อมูล)");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          // Handle quoted CSV values properly
          const values: string[] = [];
          let currentValue = "";
          let insideQuotes = false;

          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];

            if (char === '"') {
              if (
                insideQuotes &&
                j + 1 < lines[i].length &&
                lines[i][j + 1] === '"'
              ) {
                // Handle escaped quotes
                currentValue += '"';
                j++; // Skip next quote
              } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
              }
            } else if (char === "," && !insideQuotes) {
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
                job[header] = values[index].split(";").map((tag) => tag.trim());
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
      setIsImportDialogOpen(false);
      setJsonInput("");
      setCsvInput("");
      setFileContent("");
      setUploadedFile(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);

      // Auto-detect file type
      if (file.name.endsWith(".json")) {
        setImportType("json");
      } else if (file.name.endsWith(".csv")) {
        setImportType("csv");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            ส่งออก
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ส่งออกข้อมูล</DialogTitle>
            <DialogDescription>
              เลือกรูปแบบไฟล์ที่ต้องการส่งออก
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 h-auto py-6"
              onClick={() => handleExport("json")}
            >
              <FileJson className="h-8 w-8" />
              <span>JSON</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 h-auto py-6"
              onClick={() => handleExport("csv")}
            >
              <FileText className="h-8 w-8" />
              <span>CSV</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={false}>
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

          <Tabs
            defaultValue="manual"
            onValueChange={(v) => setInputMethod(v as "manual" | "upload")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">กรอกด้วยตนเอง</TabsTrigger>
              <TabsTrigger value="upload">อัปโหลดไฟล์</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <Tabs
                defaultValue="json"
                onValueChange={(v) => setImportType(v as "json" | "csv")}
              >
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
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">อัปโหลดไฟล์</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      เลือกไฟล์
                    </Button>
                  </div>
                  {uploadedFile && (
                    <div className="mt-2">
                      <Alert>
                        <AlertTitle>ไฟล์ที่เลือก</AlertTitle>
                        <AlertDescription>
                          {uploadedFile.name} (
                          {(uploadedFile.size / 1024).toFixed(2)} KB)
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  {fileContent && (
                    <div className="mt-4">
                      <Label>ตัวอย่างเนื้อหา</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        <pre className="text-xs overflow-auto max-h-32">
                          {fileContent.substring(0, 300)}
                          {fileContent.length > 300 && "..."}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Tabs
                    defaultValue="json"
                    onValueChange={(v) => setImportType(v as "json" | "csv")}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="json">JSON</TabsTrigger>
                      <TabsTrigger value="csv">CSV</TabsTrigger>
                    </TabsList>
                  </Tabs>
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
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleImport}>นำเข้า</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
