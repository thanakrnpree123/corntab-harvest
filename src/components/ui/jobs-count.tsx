
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api-service";
import { Loader2 } from "lucide-react";

interface JobsCountProps {
  projectId: string;
}

export function JobsCount({ projectId }: JobsCountProps) {
  const { data: count, isLoading } = useQuery({
    queryKey: ['jobsCount', projectId],
    queryFn: async () => {
      try {
        const response = await apiService.getJobsByProject(projectId);
        if (response.success && response.data) {
          return response.data.length;
        }
        return 0;
      } catch (error) {
        console.warn("Error fetching jobs count:", error);
        return 0;
      }
    }
  });

  if (isLoading) {
    return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
  }

  return (
    <Badge variant="outline" className="font-normal">
      {count || 0}
    </Badge>
  );
}
