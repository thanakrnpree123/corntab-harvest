
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CronJob } from "@/lib/types";
import { Download, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JobExportImportProps {
  jobs: CronJob[];
  onImport: (jobs: Partial<CronJob>[]) => void;
}

export function JobExportImport({ jobs, onImport }: JobExportImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");
  const { toast } = useToast();

  const handleExport = (format: "json" | "csv") => {
    // Prepare job data for export, removing sensitive or unnecessary fields
    const exportJobs = jobs.map(job => {
      // Clone the job to avoid mutating the original
      const { id, createdAt, updatedAt, lastRun, nextRun, successCount, failCount, averageRuntime, ...exportJob } = job;
      return exportJob;
    });

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(exportJobs, null, 2);
      filename = `jobs-export-${new Date().toISOString().slice(0, 10)}.json`;
      mimeType = "application/json";
    } else {
      // Simple CSV generation
      const headers = ["name", "schedule", "endpoint", "httpMethod", "description", "projectId", "timezone", "useLocalTime"];
      const csvContent = [
        headers.join(","),
        ...exportJobs.map(job => 
          headers.map(header => {
            const value = job[header as keyof typeof job];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(",")
        )
      ].join("\n");
      
      content = csvContent;
      filename = `jobs-export-${new Date().toISOString().slice(0, 10)}.csv`;
      mimeType = "text/csv";
    }

    // Create a download link and trigger it
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${jobs.length} jobs exported as ${format.toUpperCase()}`,
    });
  };

  const handleImport = () => {
    setImportError("");
    
    try {
      if (!importData.trim()) {
        setImportError("Please provide valid JSON data");
        return;
      }

      const importedJobs = JSON.parse(importData);
      
      if (!Array.isArray(importedJobs)) {
        setImportError("Invalid format. Expected an array of jobs");
        return;
      }

      // Validate each job has required fields
      const requiredFields = ["name", "schedule", "endpoint", "httpMethod", "projectId"];
      const validJobs = importedJobs.filter(job => {
        return requiredFields.every(field => job[field] !== undefined);
      });

      if (validJobs.length === 0) {
        setImportError("No valid jobs found in the import data");
        return;
      }

      onImport(validJobs);
      setIsOpen(false);
      setImportData("");
      
      toast({
        title: "Import successful",
        description: `${validJobs.length} jobs imported successfully`,
      });
    } catch (error) {
      setImportError(`Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex gap-2">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Jobs</DialogTitle>
          <DialogDescription>
            Paste your JSON job data below to import jobs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              className="font-mono h-[200px]"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='[{ "name": "Job Name", "schedule": "0 0 * * *", ... }]'
              element="textarea"
            />
          </div>

          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import Jobs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
