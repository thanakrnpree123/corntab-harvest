
import { useState } from "react";
import { Project } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProjectCardProps {
  project: Project;
  onAddJob: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onViewJobs: (projectId: string) => void;
  isSelected: boolean;
}

export function ProjectCard({ 
  project, 
  onAddJob, 
  onDeleteProject, 
  onViewJobs,
  isSelected 
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(isSelected);

  return (
    <Card className={`mb-4 ${isSelected ? 'border-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl cursor-pointer" onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) onViewJobs(project.id);
          }}>
            {project.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAddJob(project.id)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Job
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{project.name}"? This action cannot be undone.
                    All jobs within this project will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeleteProject(project.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <CollapsibleTrigger
              onClick={() => {
                setIsOpen(!isOpen);
                if (!isOpen) onViewJobs(project.id);
              }}
              className="p-2 rounded-md hover:bg-muted"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      
      {project.description && (
        <CardContent className="pt-0 pb-2">
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </CardContent>
      )}
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="px-6 py-2">
            {/* This is where jobs will be rendered by parent component */}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
