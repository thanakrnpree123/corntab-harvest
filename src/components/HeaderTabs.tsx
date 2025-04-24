
import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function HeaderTabs({ activeTab, onTabChange }: HeaderTabsProps) {
  const handleTabChange = useCallback((value: string) => {
    onTabChange(value);
  }, [onTabChange]);

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-4">Recent Jobs</h1>
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
          <TabsTrigger
            value="recent"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            common.recent
          </TabsTrigger>
          <TabsTrigger
            value="failed"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            common.failed
          </TabsTrigger>
          <TabsTrigger
            value="paused"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            common.paused
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
