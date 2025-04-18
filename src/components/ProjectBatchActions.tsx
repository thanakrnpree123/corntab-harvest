
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowDownToLine, 
  Trash2, 
  FileJson, 
  FileText,
} from "lucide-react";

interface ProjectBatchActionsProps {
  projects: Project[];
  selectedProjectIds: string[];
  onExport: (projectIds: string[], format: "json" | "csv") => void;
  onDelete: (projectIds: string[]) => void;
  disabled?: boolean;
}

export function ProjectBatchActions({ 
  projects, 
  selectedProjectIds, 
  onExport, 
  onDelete,
  disabled = false 
}: ProjectBatchActionsProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = (format: "json" | "csv") => {
    if (selectedProjectIds.length === 0) {
      toast({
        title: "กรุณาเลือกโปรเจค",
        description: "โปรดเลือกโปรเจคที่ต้องการส่งออกก่อน",
        variant: "destructive",
      });
      return;
    }
    
    onExport(selectedProjectIds, format);
    setIsExportDialogOpen(false);
    
    toast({
      title: "ส่งออกโปรเจค",
      description: `กำลังส่งออก ${selectedProjectIds.length} โปรเจคในรูปแบบ ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            disabled={selectedProjectIds.length === 0 || disabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบที่เลือก
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบโปรเจคที่เลือก</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโปรเจคที่เลือกทั้งหมด {selectedProjectIds.length} โปรเจคใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้ และจะลบงานทั้งหมดที่อยู่ในโปรเจคด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(selectedProjectIds)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบโปรเจค
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedProjectIds.length === 0 || disabled}
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            ส่งออก
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ส่งออกข้อมูลโปรเจค</DialogTitle>
            <DialogDescription>
              เลือกรูปแบบไฟล์ที่ต้องการส่งออก {selectedProjectIds.length} โปรเจค
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
    </div>
  );
}
