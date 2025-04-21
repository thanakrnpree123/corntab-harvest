
import { Project, CronJob } from "@/lib/types";
import { 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Clipboard 
} from "lucide-react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import dayjs from "dayjs";
import { toast } from "@/hooks/use-toast";

interface ProjectRowProps {
  project: Project;
  isSelected: boolean;
  onSelect: (projectId: string, checked: boolean) => void;
  isOpen: boolean;
  isLoading: boolean;
  jobCount: number;
  onViewProjectJobs: (projectId: string) => void;
}

export function ProjectRow({
  project,
  isSelected,
  onSelect,
  isOpen,
  isLoading,
  jobCount,
  onViewProjectJobs,
}: ProjectRowProps) {
  return (
    <TableRow className={`${isSelected ? "bg-muted/50" : ""} cursor-pointer hover:bg-muted/40 transition-colors`}>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onSelect(project.id, checked === true)
          }
        />
      </TableCell>
      <TableCell className="font-medium">
        <div
          className="flex items-center gap-2"
          onClick={() => {
            onViewProjectJobs(project.id);
            toast({
              title: "เปิดโปรเจค",
              description: `กำลังดูรายละเอียดโปรเจค "${project.name}"`,
            });
          }}
        >
          <CollapsibleTrigger
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          {project.name}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell truncate">
        {project.description || "-"}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {dayjs(project.createdAt).format("DD/MM/YYYY")}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <Clipboard className="h-4 w-4 text-muted-foreground" />
          {isLoading ? (
            <span className="text-muted-foreground text-sm">
              กำลังโหลด...
            </span>
          ) : (
            <Badge
              variant="outline"
              className="text-xs font-normal"
            >
              {jobCount} งาน
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
