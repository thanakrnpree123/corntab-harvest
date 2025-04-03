
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import MainLayout from "@/components/layout/MainLayout";
import { ChevronRight, Layers, Activity, Timer, Settings } from "lucide-react";
import { format } from "date-fns";

export default function Index() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  
  const features = [
    {
      title: 'Job Scheduling',
      description: 'Schedule jobs with cron expressions or fixed intervals',
      icon: <Timer className="h-6 w-6" />
    },
    {
      title: 'HTTP Webhooks',
      description: 'Make HTTP requests to any endpoint with custom data',
      icon: <Activity className="h-6 w-6" />
    },
    {
      title: 'Project Organization',
      description: 'Organize jobs into projects for better management',
      icon: <Layers className="h-6 w-6" />
    },
    {
      title: 'Advanced Settings',
      description: 'Configure timeouts, retries, and notifications',
      icon: <Settings className="h-6 w-6" />
    }
  ];
  
  const { isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          const jobs = response.data;
          
          setStats({
            totalJobs: jobs.length,
            activeJobs: jobs.filter(job => job.status === 'running').length,
            completedJobs: jobs.filter(job => job.status === 'success').length,
            failedJobs: jobs.filter(job => job.status === 'failed').length
          });
          
          const recent = [...jobs]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
          
          setRecentJobs(recent);
          return jobs;
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return [];
      }
    }
  });

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Overview of your scheduled jobs and system status
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="h-full">
            <div className="bg-white rounded-lg shadow h-full p-6 flex flex-col">
              <div className="mb-4 text-blue-600">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : recentJobs.length > 0 ? (
              <div className="flex flex-col">
                {recentJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="py-3 flex justify-between items-center border-b border-gray-200 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {job.lastRun ? `Last run: ${format(new Date(job.lastRun), 'MMM dd, HH:mm')}` : 'Never run'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                <p>No recent jobs found</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="bg-gray-100 rounded p-4 text-center">
                  <h4 className="text-2xl font-bold">{stats.totalJobs}</h4>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                </div>
              </div>
              <div>
                <div className="bg-gray-100 rounded p-4 text-center">
                  <h4 className="text-2xl font-bold text-blue-600">{stats.activeJobs}</h4>
                  <p className="text-sm text-gray-500">Active Jobs</p>
                </div>
              </div>
              <div>
                <div className="bg-gray-100 rounded p-4 text-center">
                  <h4 className="text-2xl font-bold text-green-600">{stats.completedJobs}</h4>
                  <p className="text-sm text-gray-500">Completed Jobs</p>
                </div>
              </div>
              <div>
                <div className="bg-gray-100 rounded p-4 text-center">
                  <h4 className="text-2xl font-bold text-red-600">{stats.failedJobs}</h4>
                  <p className="text-sm text-gray-500">Failed Jobs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
