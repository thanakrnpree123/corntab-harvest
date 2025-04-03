
import { useState } from "react";
import { CronJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, File } from "lucide-react";

interface JobExportImportProps {
  jobs: CronJob[];
  onImportJobs: (jobs: CronJob[]) => void;
}

export function JobExportImport({ jobs, onImportJobs }: JobExportImportProps) {
  const [open, setOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExportJobs = () => {
    const dataStr = JSON.stringify(jobs, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileName = `jobs-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImportFile(file);
  };

  const handleImportJobs = () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        if (!Array.isArray(jsonData)) {
          toast({
            title: "Invalid file format",
            description: "The uploaded file doesn't contain an array of jobs.",
            variant: "destructive",
          });
          return;
        }

        // Validate each job in the array
        const validJobs: CronJob[] = [];
        for (const job of jsonData) {
          if (
            typeof job === "object" &&
            job !== null &&
            typeof job.name === "string" &&
            typeof job.schedule === "string" &&
            typeof job.endpoint === "string" &&
            typeof job.httpMethod === "string" &&
            typeof job.projectId === "string" &&
            typeof job.status === "string"
          ) {
            validJobs.push(job as CronJob);
          } else {
            toast({
              title: "File contains invalid job data",
              description:
                "The uploaded file doesn't contain valid job data. Please check the file and try again.",
              variant: "destructive",
            });
            return;
          }
        }

        onImportJobs(validJobs);
        toast({
          title: "Jobs imported",
          description: `${validJobs.length} jobs have been successfully imported.`,
        });
        setOpen(false);
        setImportFile(null);
      } catch (error) {
        toast({
          title: "Error parsing file",
          description:
            "There was an error parsing the file. Please make sure it's a valid JSON file.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(importFile);
  };

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handleExportJobs}>
        <Download className="h-4 w-4 mr-2" />
        Export Jobs
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Jobs
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Jobs</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing job configurations to import.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="importFile" className="text-right">
                Import File
              </Label>
              <Input
                type="file"
                id="importFile"
                className="col-span-3"
                onChange={handleFileChange}
                accept=".json"
              />
            </div>
          </div>
          <Button variant="default" onClick={handleImportJobs} disabled={!importFile}>
            Import
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
