
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JobStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
  pulsing?: boolean;
}

export function StatusBadge({ status, className, pulsing = false }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "idle":
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
      case "running":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "success":
        return "bg-success-light text-success hover:bg-green-200";
      case "failed":
        return "bg-error-light text-error hover:bg-red-200";
      case "paused":
        return "bg-warning-light text-warning hover:bg-yellow-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  return (
    <Badge 
      className={cn(
        getStatusStyles(), 
        pulsing && status === "running" ? "animate-pulse-subtle" : "",
        className
      )}
      variant="outline"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
