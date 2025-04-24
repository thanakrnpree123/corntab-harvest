
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import React from "react";

type ColorOption = "blue" | "green" | "red" | "gray" | "yellow";

const colorClasses: Record<ColorOption, string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  gray: "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
  yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
};

export function StatsCard({
  title,
  value,
  color = "blue",
  icon: Icon = Activity
}: {
  title: string;
  value: number;
  color?: ColorOption;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
