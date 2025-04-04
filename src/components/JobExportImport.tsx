
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Import, FileJson, Download, Upload, AlertTriangle } from "lucide-react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { useToast } from "@/hooks/use-toast";

interface JobExportImportProps {
  onImport: (jobs: any[]) => void;
  jobs: any[];
}

export function JobExportImport({ onImport, jobs }: JobExportImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importType, setImportType] = useState<'append' | 'replace'>('append');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = JSON.stringify(jobs, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cron-jobs-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "ส่งออกงานสำเร็จ",
      description: `ส่งออกงาน ${jobs.length} รายการ`,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const importedJobs = JSON.parse(result);
            if (Array.isArray(importedJobs)) {
              onImport(importedJobs);
              setIsOpen(false);
              setFile(null);
              toast({
                title: "นำเข้างานสำเร็จ",
                description: `นำเข้างาน ${importedJobs.length} รายการ`,
              });
            } else {
              throw new Error("Invalid format");
            }
          }
        } catch (error) {
          toast({
            title: "นำเข้างานล้มเหลว",
            description: "ไฟล์ไม่ถูกต้อง โปรดตรวจสอบรูปแบบไฟล์",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const preventDefaultDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        startIcon={<Import size={16} />}
      >
        นำเข้า/ส่งออก
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>นำเข้า/ส่งออกงาน CRON</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                ส่งออกงาน CRON
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ส่งออกงาน CRON ทั้งหมดเป็นไฟล์ JSON
              </Typography>
              <Button 
                onClick={handleExport}
                startIcon={<Download size={16} />}
                variant="outline"
              >
                ส่งออก ({jobs.length})
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                นำเข้างาน CRON
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                นำเข้างาน CRON จากไฟล์ JSON
              </Typography>

              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              {file ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FileJson size={24} />
                    <Box>
                      <Typography variant="body2">{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  </Box>

                  <Alert 
                    severity="info" 
                    sx={{ mb: 2 }}
                    action={
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setFile(null)}
                      >
                        เปลี่ยน
                      </Button>
                    }
                  >
                    ไฟล์พร้อมนำเข้า
                  </Alert>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      รูปแบบการนำเข้า:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        size="sm"
                        variant={importType === "append" ? "default" : "outline"}
                        onClick={() => setImportType("append")}
                      >
                        เพิ่มเติม
                      </Button>
                      <Button
                        size="sm"
                        variant={importType === "replace" ? "default" : "outline"}
                        onClick={() => setImportType("replace")}
                      >
                        แทนที่ทั้งหมด
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box
                  onDrop={handleFileDrop}
                  onDragOver={preventDefaultDrag}
                  onDragEnter={preventDefaultDrag}
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    mt: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={triggerFileInput}
                >
                  <Upload size={32} className="mx-auto mb-2" />
                  <Typography variant="body1" gutterBottom>
                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    รองรับเฉพาะไฟล์ .JSON เท่านั้น
                  </Typography>
                </Box>
              )}

              {importType === "replace" && (
                <Alert 
                  icon={<AlertTriangle size={16} />}
                  severity="warning" 
                  sx={{ mt: 2 }}
                >
                  การแทนที่จะลบงาน CRON ทั้งหมดที่มีอยู่และแทนที่ด้วยงานที่นำเข้า
                </Alert>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file}
          >
            นำเข้า
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
