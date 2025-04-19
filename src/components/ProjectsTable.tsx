
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/lib/types";
import { Card, CardContent } from "./ui/card";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilters } from "./ProjectFilters";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectsTable({ projects, isLoading }: ProjectsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setSortBy("name");
    setSortOrder("asc");

    toast({
      title: "ล้างตัวกรอง",
      description: "ล้างตัวกรองทั้งหมดเรียบร้อยแล้ว",
    });
  };

  const filteredProjects = projects.filter((project) => {
    const searchMatch =
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    let dateMatch = true;
    const projectDate = new Date(project.createdAt);

    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateMatch = projectDate >= today;
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateMatch = projectDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateMatch = projectDate >= monthAgo;
    }

    return searchMatch && dateMatch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "date":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "jobs":
        comparison = (a.jobs?.length || 0) - (b.jobs?.length || 0);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleViewProjectJobs = (projectId: string) => {
    navigate(`/jobs/${projectId}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <ProjectFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onClearFilters={handleClearFilters}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              กำลังโหลดโปรเจค...
            </span>
          </div>
        ) : sortedProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleViewProjectJobs(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              ไม่พบโปรเจคที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
