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
import { Project, CronJob } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export interface ProjectWithJobs extends Project {
  jobs: CronJob[];
}

export interface ProjectExportImportProps {
  projects: Project[];
  jobs: CronJob[];
  onImport: (projects: ProjectWithJobs[]) => void;
  onExport?: (projectIds: string[], format: "json" | "csv") => void;
}

export function ProjectExportImport({ projects, jobs, onImport, onExport }: ProjectExportImportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importType, setImportType] = useState<"json" | "csv">("json");
  const [importMethod, setImportMethod] = useState<"manual" | "upload">("manual");
  const [jsonInput, setJsonInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = (type: "json" | "csv") => {
    if (onExport) {
      onExport([], type);
      return;
    }
    
    const exportData = projects.map(project => {
      const projectJobs = jobs.filter(job => job.projectId === project.id);
      
      const formattedJobs = projectJobs.map(job => ({
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
      
      return {
        name: project.name,
        description: project.description,
        jobs: formattedJobs
      };
    });

    let content: string;
    let filename: string;
    let mimeType: string;

    if (type === "json") {
      content = JSON.stringify(exportData, null, 2);
      filename = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = "application/json";
    } else {
      const projectHeaders = ["project_id", "project_name", "project_description"].join(",");
      const jobHeaders = [
        "project_id",
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

      const projectRows = projects.map((project, index) => {
        return [
          index + 1,
          `"${(project.name || "").replace(/"/g, '""')}"`,
          `"${(project.description || "").replace(/"/g, '""')}"`,
        ].join(",");
      });

      const jobRows = [];
      projects.forEach((project, index) => {
        const projectJobs = jobs.filter(job => job.projectId === project.id);
        projectJobs.forEach(job => {
          jobRows.push([
            index + 1,
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
          ].join(","));
        });
      });

      content = [
        "[PROJECTS]",
        projectHeaders,
        ...projectRows,
        "",
        "[JOBS]",
        jobHeaders,
        ...jobRows
      ].join("\n");
      
      filename = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = "text/csv";
    }

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
      description: `ส่งออกข้อมูล ${projects.length} โปรเจคพร้อมงานเรียบร้อยแล้ว`,
    });
  };

  const handleImport = () => {
    setImportError(null);
    
    try {
      let content = "";
      
      if (importMethod === "manual") {
        content = importType === "json" ? jsonInput : csvInput;
      } else if (importMethod === "upload" && uploadedFile) {
        const reader = new FileReader();
        reader.readAsText(uploadedFile);
        reader.onload = (e) => {
          const fileContent = e.target?.result as string;
          processImportContent(fileContent);
        };
        return;
      } else {
        setImportError(importMethod === "upload" ? "กรุณาเลือกไฟล์ที่จะนำเข้า" : "กรุณาป้อนข้อมูล");
        return;
      }
      
      if (!content.trim()) {
        setImportError(`กรุณาป้อนข้อมูล ${importType.toUpperCase()}`);
        return;
      }
      
      processImportContent(content);
      
    } catch (error) {
      setImportError(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
      
      toast({
        title: "นำเข้าไม่สำเร็จ",
        description: `เกิดข้อผิดพลาด: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const processImportContent = (content: string) => {
    try {
      let projectsToImport: ProjectWithJobs[] = [];
      
      if (importType === "json") {
        if (!content.trim()) {
          setImportError("กรุณาป้อนข้อมูล JSON");
          return;
        }
        
        const parsedData = JSON.parse(content);
        
        if (!Array.isArray(parsedData)) {
          setImportError("ข้อมูล JSON ต้องเป็นรูปแบบอาร์เรย์");
          return;
        }
        
        projectsToImport = parsedData.map(project => ({
          ...project,
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          jobs: Array.isArray(project.jobs) ? project.jobs : []
        }));
      } else {
        if (!csvInput.trim()) {
          setImportError("กรุณาป้อนข้อมูล CSV");
          return;
        }
        
        const lines = csvInput.split("\n");
        if (lines.length < 3) {
          setImportError("ข้อมูล CSV ไม่ถูกต้อง");
          return;
        }
        
        const projectsSectionStart = lines.indexOf("[PROJECTS]");
        const jobsSectionStart = lines.indexOf("[JOBS]");
        
        if (projectsSectionStart === -1 || jobsSectionStart === -1) {
          setImportError("ข้อมูล CSV ไม่มีส่วน [PROJECTS] หรือ [JOBS]");
          return;
        }
        
        const projectsStartLine = projectsSectionStart + 1;
        const projectsEndLine = jobsSectionStart > projectsSectionStart 
          ? jobsSectionStart - 1 
          : lines.length;
        
        if (projectsStartLine >= projectsEndLine) {
          setImportError("ไม่พบข้อมูลโปรเจคในส่วน [PROJECTS]");
          return;
        }
        
        const projectHeaders = lines[projectsStartLine].split(",").map(h => h.trim());
        const projectsMap = new Map<number, ProjectWithJobs>();
        
        for (let i = projectsStartLine + 1; i < projectsEndLine; i++) {
          if (!lines[i].trim()) continue;
          
          const values = parseCSVLine(lines[i]);
          
          if (!values || values.length < 3) continue;
          
          const projectId = parseInt(values[0]);
          if (isNaN(projectId)) continue;
          
          projectsMap.set(projectId, {
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: values[1].replace(/^"|"$/g, ''),
            description: values[2].replace(/^"|"$/g, ''),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            jobs: []
          });
        }
        
        if (jobsSectionStart !== -1) {
          const jobsStartLine = jobsSectionStart + 1;
          if (jobsStartLine < lines.length) {
            const jobHeaders = lines[jobsStartLine].split(",").map(h => h.trim());
            
            for (let i = jobsStartLine + 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              
              const values = parseCSVLine(lines[i]);
              
              if (!values || values.length < 5) continue;
              
              const projectId = parseInt(values[0]);
              if (isNaN(projectId) || !projectsMap.has(projectId)) continue;
              
              const project = projectsMap.get(projectId)!;
              
              const job: Partial<CronJob> = {
                name: values[1].replace(/^"|"$/g, ''),
                description: values[2].replace(/^"|"$/g, ''),
                schedule: values[3].replace(/^"|"$/g, ''),
                endpoint: values[4].replace(/^"|"$/g, ''),
                httpMethod: values[5].replace(/^"|"$/g, '') as any,
                timezone: values[6].replace(/^"|"$/g, ''),
                useLocalTime: values[7] === "true",
              };
              
              if (values.length > 8) {
                job.tags = values[8].replace(/^"|"$/g, '').split(";").filter(t => t);
              }
              
              if (values.length > 9) {
                try {
                  job.headers = JSON.parse(values[9].replace(/^"|"$/g, ''));
                } catch (e) {
                  job.headers = {};
                }
              }
              
              if (values.length > 10) {
                job.body = values[10].replace(/^"|"$/g, '');
              }
              
              if (values.length > 11) {
                job.emailNotifications = values[11].replace(/^"|"$/g, '');
              }
              
              if (values.length > 12) {
                job.webhookUrl = values[12].replace(/^"|"$/g, '');
              }
              
              project.jobs.push(job as CronJob);
            }
          }
        }
        
        projectsToImport = Array.from(projectsMap.values());
      }
      
      if (projectsToImport.length === 0) {
        setImportError("ไม่พบข้อมูลโปรเจคที่จะนำเข้า");
        return;
      }
      
      for (const project of projectsToImport) {
        if (!project.name) {
          setImportError("ทุกโปรเจคต้องมีชื่อ");
          return;
        }
        
        if (project.jobs) {
          for (const job of project.jobs) {
            if (!job.name) {
              setImportError(`งานในโปรเจค "${project.name}" ไม่มีชื่อ`);
              return;
            }
            
            if (!job.schedule) {
              setImportError(`งาน "${job.name}" ในโปรเจค "${project.name}" ไม่มีกำหนดการทำงาน`);
              return;
            }
            
            if (!job.endpoint) {
              setImportError(`งาน "${job.name}" ในโปรเจค "${project.name}" ไม่มี endpoint`);
              return;
            }
          }
        }
      }
      
      onImport(projectsToImport);
      setIsDialogOpen(false);
      setJsonInput("");
      setCsvInput("");
      setUploadedFile(null);
      
      toast({
        title: "นำเข้าสำเร็จ",
        description: `นำเข้า ${projectsToImport.length} โปรเจคพร้อมงานเรียบร้อยแล้ว`,
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
    if (file) {
      setUploadedFile(file);
      
      if (file.name.endsWith('.json')) {
        setImportType('json');
      } else if (file.name.endsWith('.csv')) {
        setImportType('csv');
      }
    }
  };

  const parseCSVLine = (line: string): string[] | null => {
    const values: string[] = [];
    let currentValue = "";
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (insideQuotes && j + 1 < line.length && line[j + 1] === '"') {
          currentValue += '"';
          j++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    
    return values;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Projects</DialogTitle>
          <DialogDescription>
            Import from JSON/CSV your projects and jobs
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="manual" onValueChange={(v) => setImportMethod(v as "manual" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <Tabs defaultValue="json" onValueChange={(v) => setImportType(v as "json" | "csv")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
              </TabsList>
              <TabsContent value="json">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="json-input">JSON Data</Label>
                    <Textarea
                      id="json-input"
                      placeholder='[{"name": "Project Name", "description": "Project Description", "jobs": [...]}]'
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
                    <Label htmlFor="csv-input">CSV Data</Label>
                    <Textarea
                      id="csv-input"
                      placeholder="[PROJECTS]
project_id,project_name,project_description
1,Marketing,Marketing campaigns

[JOBS]
project_id,name,description,schedule,endpoint,httpMethod
1,Daily Report,Send daily report,0 0 * * *,https://example.com/reports,POST"
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
                <Label htmlFor="file-upload">Upload File</Label>
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
                    Browse
                  </Button>
                </div>
                {uploadedFile && (
                  <div className="mt-2">
                    <Alert>
                      <AlertTitle>File selected</AlertTitle>
                      <AlertDescription>
                        {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Tabs defaultValue="json" onValueChange={(v) => setImportType(v as "json" | "csv")}>
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
