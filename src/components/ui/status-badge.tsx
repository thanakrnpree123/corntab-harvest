
import { cva } from "class-variance-authority";
import { JobStatus } from "@/lib/types";
import { Check, Clock, AlertCircle, Pause, Play } from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
        running: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
        failed: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
        idle: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
        paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
      },
    },
    defaultVariants: {
      variant: "idle",
    },
  }
);

interface StatusBadgeProps {
  status: JobStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className = "" }: StatusBadgeProps) {
  const getVariant = (status: JobStatus) => {
    switch (status) {
      case "success":
        return "success";
      case "running":
        return "running";
      case "failed":
        return "failed";
      case "paused":
        return "paused";
      default:
        return "idle";
    }
  };

  const getIcon = (status: JobStatus) => {
    switch (status) {
      case "success":
        return <Check className="mr-1 h-3 w-3" />;
      case "running":
        return <Play className="mr-1 h-3 w-3" />;
      case "failed":
        return <AlertCircle className="mr-1 h-3 w-3" />;
      case "paused":
        return <Pause className="mr-1 h-3 w-3" />;
      default:
        return <Clock className="mr-1 h-3 w-3" />;
    }
  };

  return (
    <span className={statusBadgeVariants({ variant: getVariant(status), className })}>
      {showIcon && getIcon(status)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
